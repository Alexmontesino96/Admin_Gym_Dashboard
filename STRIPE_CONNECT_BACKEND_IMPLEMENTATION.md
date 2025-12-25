# Stripe Connect Backend Implementation Guide

Este documento contiene todos los archivos que necesitas crear en tu repositorio FastAPI para implementar Stripe Connect.

## Prerequisitos

```bash
pip install stripe
```

Agregar a `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
FRONTEND_URL=http://localhost:3000  # o tu URL de producción
```

---

## 1. Schemas de Pydantic

**`app/schemas/stripe.py`** (Nuevo archivo)

```python
from pydantic import BaseModel, EmailStr
from typing import Optional

class StripeConnectionStatus(BaseModel):
    is_connected: bool
    account_id: Optional[str] = None
    onboarding_completed: bool
    charges_enabled: bool
    payouts_enabled: bool

class StripeAccountCreate(BaseModel):
    country: str  # "US", "MX", etc.
    email: EmailStr
    business_type: str  # "individual" o "company"

class StripeOnboardingLinkResponse(BaseModel):
    url: str
    expires_at: int
```

---

## 2. Migración de Base de Datos

**Alembic Migration: `alembic/versions/xxxx_add_stripe_connect_fields.py`**

```python
"""add stripe connect fields to gym

Revision ID: xxxx_stripe_connect
Revises: yyyy  # Tu última revisión
Create Date: 2025-01-XX
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Agregar campos de Stripe a la tabla gyms
    op.add_column('gyms', sa.Column('stripe_account_id', sa.String(), nullable=True))
    op.add_column('gyms', sa.Column('stripe_onboarding_completed', sa.Boolean(), server_default='false'))
    op.add_column('gyms', sa.Column('stripe_charges_enabled', sa.Boolean(), server_default='false'))
    op.add_column('gyms', sa.Column('stripe_payouts_enabled', sa.Boolean(), server_default='false'))

    # Crear índice único para stripe_account_id
    op.create_index('ix_gyms_stripe_account_id', 'gyms', ['stripe_account_id'], unique=True)

def downgrade():
    op.drop_index('ix_gyms_stripe_account_id', table_name='gyms')
    op.drop_column('gyms', 'stripe_payouts_enabled')
    op.drop_column('gyms', 'stripe_charges_enabled')
    op.drop_column('gyms', 'stripe_onboarding_completed')
    op.drop_column('gyms', 'stripe_account_id')
```

**Ejecutar la migración:**
```bash
alembic revision --autogenerate -m "add stripe connect fields to gym"
alembic upgrade head
```

---

## 3. Actualizar Modelo de Gym

**`app/models/gym.py`** (Modificar)

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
# ... otros imports

class Gym(Base):
    __tablename__ = "gyms"

    # ... campos existentes ...

    # Campos de Stripe Connect
    stripe_account_id = Column(String, nullable=True, unique=True, index=True)
    stripe_onboarding_completed = Column(Boolean, default=False)
    stripe_charges_enabled = Column(Boolean, default=False)
    stripe_payouts_enabled = Column(Boolean, default=False)
```

---

## 4. API Endpoints de Stripe Connect

**`app/api/stripe_connect.py`** (Nuevo archivo)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import stripe
from app.core.config import settings
from app.api.deps import get_db, get_current_user_with_gym
from app.models.gym import Gym
from app.schemas.stripe import (
    StripeConnectionStatus,
    StripeAccountCreate,
    StripeOnboardingLinkResponse
)

router = APIRouter(prefix="/stripe-connect", tags=["stripe-connect"])

# Configurar Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.get("/connection-status", response_model=StripeConnectionStatus)
async def get_connection_status(
    current_user_gym=Depends(get_current_user_with_gym),
    db: Session = Depends(get_db)
):
    """
    Obtiene el estado de la conexión de Stripe Connect del gimnasio.

    Retorna:
    - is_connected: bool
    - account_id: str | null
    - onboarding_completed: bool
    - charges_enabled: bool
    - payouts_enabled: bool
    """
    gym = db.query(Gym).filter(Gym.id == current_user_gym.gym_id).first()

    if not gym:
        raise HTTPException(status_code=404, detail="Gimnasio no encontrado")

    if not gym.stripe_account_id:
        return StripeConnectionStatus(
            is_connected=False,
            account_id=None,
            onboarding_completed=False,
            charges_enabled=False,
            payouts_enabled=False
        )

    try:
        # Obtener información actualizada de la cuenta de Stripe
        account = stripe.Account.retrieve(gym.stripe_account_id)

        # Actualizar campos en BD si cambiaron
        if gym.stripe_onboarding_completed != account.details_submitted:
            gym.stripe_onboarding_completed = account.details_submitted
        if gym.stripe_charges_enabled != account.charges_enabled:
            gym.stripe_charges_enabled = account.charges_enabled
        if gym.stripe_payouts_enabled != account.payouts_enabled:
            gym.stripe_payouts_enabled = account.payouts_enabled
        db.commit()

        return StripeConnectionStatus(
            is_connected=True,
            account_id=gym.stripe_account_id,
            onboarding_completed=account.details_submitted,
            charges_enabled=account.charges_enabled,
            payouts_enabled=account.payouts_enabled
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Error de Stripe: {str(e)}")


@router.post("/accounts")
async def create_stripe_account(
    data: StripeAccountCreate,
    current_user_gym=Depends(get_current_user_with_gym),
    db: Session = Depends(get_db)
):
    """
    Crea una cuenta de Stripe Connect Standard para el gimnasio.
    """
    gym = db.query(Gym).filter(Gym.id == current_user_gym.gym_id).first()

    if not gym:
        raise HTTPException(status_code=404, detail="Gimnasio no encontrado")

    if gym.stripe_account_id:
        raise HTTPException(
            status_code=400,
            detail="Este gimnasio ya tiene una cuenta de Stripe conectada"
        )

    try:
        # Crear Standard Account
        account = stripe.Account.create(
            type="standard",
            country=data.country,
            email=data.email,
            capabilities={
                "card_payments": {"requested": True},
                "transfers": {"requested": True}
            },
            business_type=data.business_type,
            metadata={
                "gym_id": str(gym.id),
                "gym_name": gym.name
            }
        )

        # Guardar account_id en el gimnasio
        gym.stripe_account_id = account.id
        db.commit()
        db.refresh(gym)

        return {
            "account_id": account.id,
            "message": "Cuenta de Stripe creada exitosamente"
        }

    except stripe.error.StripeError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error de Stripe: {str(e)}")


@router.get("/onboarding-link", response_model=StripeOnboardingLinkResponse)
async def get_onboarding_link(
    current_user_gym=Depends(get_current_user_with_gym),
    db: Session = Depends(get_db)
):
    """
    Genera un Account Link para completar el onboarding de Stripe.
    """
    gym = db.query(Gym).filter(Gym.id == current_user_gym.gym_id).first()

    if not gym:
        raise HTTPException(status_code=404, detail="Gimnasio no encontrado")

    if not gym.stripe_account_id:
        raise HTTPException(
            status_code=404,
            detail="Este gimnasio no tiene una cuenta de Stripe. Crea una primero."
        )

    try:
        # URLs de retorno
        base_url = settings.FRONTEND_URL
        return_url = f"{base_url}/onboarding/stripe/complete"
        refresh_url = f"{base_url}/onboarding/stripe/refresh"

        # Crear Account Link
        account_link = stripe.AccountLink.create(
            account=gym.stripe_account_id,
            refresh_url=refresh_url,
            return_url=return_url,
            type="account_onboarding"
        )

        return StripeOnboardingLinkResponse(
            url=account_link.url,
            expires_at=account_link.expires_at
        )

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Error de Stripe: {str(e)}")
```

---

## 5. Registrar Router en Main App

**`app/main.py`** (Modificar)

```python
from app.api import stripe_connect  # Agregar import

# ...

# Registrar router
app.include_router(stripe_connect.router, prefix="/api")
```

---

## 6. Configuración (Settings)

**`app/core/config.py`** (Modificar)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ... configuraciones existentes ...

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 7. Testing

### Test Manual con cURL

```bash
# 1. Obtener status de conexión
curl -X GET "http://localhost:8000/api/stripe-connect/connection-status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Gym-ID: 1"

# 2. Crear cuenta de Stripe
curl -X POST "http://localhost:8000/api/stripe-connect/accounts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Gym-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "US",
    "email": "gym@example.com",
    "business_type": "company"
  }'

# 3. Obtener onboarding link
curl -X GET "http://localhost:8000/api/stripe-connect/onboarding-link" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Gym-ID: 1"
```

### Unit Tests

**`tests/test_stripe_connect.py`** (Nuevo archivo)

```python
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_stripe_account():
    with patch('stripe.Account.create') as mock:
        mock.return_value = MagicMock(
            id='acct_test123',
            details_submitted=False,
            charges_enabled=False,
            payouts_enabled=False
        )
        yield mock

@pytest.fixture
def mock_stripe_link():
    with patch('stripe.AccountLink.create') as mock:
        mock.return_value = MagicMock(
            url='https://connect.stripe.com/setup/test',
            expires_at=1234567890
        )
        yield mock

def test_create_stripe_account(mock_stripe_account, auth_headers):
    response = client.post(
        "/api/stripe-connect/accounts",
        json={
            "country": "US",
            "email": "test@gym.com",
            "business_type": "company"
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    assert "account_id" in response.json()

def test_get_onboarding_link(mock_stripe_link, auth_headers):
    response = client.get(
        "/api/stripe-connect/onboarding-link",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert "url" in response.json()
    assert response.json()["url"].startswith("https://connect.stripe.com")
```

---

## 8. Webhooks de Stripe (Opcional pero Recomendado)

**`app/api/stripe_webhooks.py`** (Nuevo archivo)

```python
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
import stripe
from app.core.config import settings
from app.api.deps import get_db
from app.models.gym import Gym

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook para recibir eventos de Stripe.
    Actualiza automáticamente el estado del onboarding.
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Manejar evento de account.updated
    if event['type'] == 'account.updated':
        account = event['data']['object']
        account_id = account['id']

        # Buscar gym con este account_id
        gym = db.query(Gym).filter(Gym.stripe_account_id == account_id).first()
        if gym:
            gym.stripe_onboarding_completed = account.get('details_submitted', False)
            gym.stripe_charges_enabled = account.get('charges_enabled', False)
            gym.stripe_payouts_enabled = account.get('payouts_enabled', False)
            db.commit()
            print(f"✅ Updated gym {gym.id} - onboarding: {gym.stripe_onboarding_completed}")

    return {"status": "success"}
```

**Configurar webhook en Stripe Dashboard:**
1. Ir a https://dashboard.stripe.com/webhooks
2. Crear endpoint: `https://tu-api.com/api/webhooks/stripe`
3. Seleccionar evento: `account.updated`
4. Copiar el Webhook Secret y agregarlo a `.env` como `STRIPE_WEBHOOK_SECRET`

---

## 9. Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│                                                         │
│  1. Usuario completa Step 2 del wizard                 │
│  2. POST /auth/register-gym-owner                      │
│     → Se crea el gym y el usuario                      │
│     → Retorna gym.id                                   │
│                                                         │
│  3. Usuario llega a Step 3 (Stripe Connect)           │
│                                                         │
│  4. useStripeConnect hook:                             │
│     a) POST /stripe-connect/accounts                   │
│        → Crea Stripe Standard Account                  │
│        → Guarda stripe_account_id en BD                │
│                                                         │
│     b) GET /stripe-connect/onboarding-link             │
│        → Genera AccountLink de Stripe                  │
│        → Retorna URL temporal                          │
│                                                         │
│  5. Abre popup con Stripe onboarding                   │
│                                                         │
│  6. Polling cada 3 segundos:                           │
│     GET /stripe-connect/connection-status              │
│     → Verifica si onboarding_completed = true          │
│                                                         │
│  7. Cuando completa, muestra pantalla de éxito         │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                      │
│                                                         │
│  Endpoints:                                             │
│  • POST   /stripe-connect/accounts                     │
│  • GET    /stripe-connect/connection-status            │
│  • GET    /stripe-connect/onboarding-link              │
│  • POST   /webhooks/stripe (opcional)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    STRIPE API                           │
│                                                         │
│  • stripe.Account.create()                             │
│  • stripe.Account.retrieve()                           │
│  • stripe.AccountLink.create()                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Checklist de Implementación

- [ ] Instalar `stripe` package
- [ ] Agregar variables de entorno `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `FRONTEND_URL`
- [ ] Crear `app/schemas/stripe.py`
- [ ] Actualizar `app/models/gym.py` con campos de Stripe
- [ ] Crear migración de Alembic y ejecutarla
- [ ] Crear `app/api/stripe_connect.py`
- [ ] Registrar router en `app/main.py`
- [ ] Actualizar `app/core/config.py`
- [ ] Probar endpoints con cURL o Postman
- [ ] (Opcional) Configurar webhook en Stripe Dashboard
- [ ] (Opcional) Crear `app/api/stripe_webhooks.py`

---

## 11. Troubleshooting

### Error: "No such account"
- Verifica que `stripe_account_id` esté guardado correctamente en la BD
- Verifica que estés usando la misma Stripe API key (test vs live)

### Error: "Invalid API Key"
- Verifica que `STRIPE_SECRET_KEY` esté en `.env` y comience con `sk_`
- Reinicia el servidor FastAPI después de agregar la variable

### Polling no detecta cuando completa
- Verifica que el frontend esté llamando al endpoint correcto
- Verifica logs del backend para ver si las requests llegan
- Considera implementar webhooks para detectar inmediatamente

### Cuenta se crea pero onboarding no funciona
- Verifica que las URLs `return_url` y `refresh_url` sean accesibles
- Verifica que `FRONTEND_URL` esté configurado correctamente

---

## 12. Próximos Pasos

Una vez implementado Stripe Connect, podrás:
1. Crear Payment Links para membresías
2. Procesar pagos directamente a la cuenta del gimnasio
3. Ver transacciones en el Stripe Dashboard del gimnasio
4. Implementar suscripciones recurrentes
5. Continuar con la **Fase 2: Pricing Modular**

¡Éxito con la implementación!
