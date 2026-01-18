from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
import os

from app.database import Base, engine, get_db
from app import models, auth
from pydantic import BaseModel, EmailStr

# ---------------- APP ----------------
app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- STATIC IMAGES ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount(
    "/images",
    StaticFiles(directory=os.path.join(BASE_DIR, "images")),
    name="images"
)

# ---------------- DB ----------------
Base.metadata.create_all(bind=engine)

# ---------------- AUTH ----------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

# ---------------- SCHEMAS ----------------
class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {"message": "Backend running"}

# ---------------- REGISTER ----------------
@app.post("/register")
def register(user: RegisterSchema, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = models.User(
        username=user.username,
        email=user.email,
        password=auth.hash_password(user.password),
    )
    db.add(new_user)
    db.commit()
    return {"message": "Registered successfully"}

# ---------------- LOGIN ----------------
@app.post("/login")
def login(user: LoginSchema, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_access_token({"user_id": db_user.id})
    return {"access_token": token}

# ---------------- CURRENT USER ----------------
@app.get("/me")
def get_me(user: models.User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }

# ---------------- PRODUCTS ----------------
@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

# ---------------- ADD TO CART ----------------
@app.post("/api/cart/add/{product_id}")
def add_to_cart(
    product_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    item = db.query(models.CartItem).filter(
        models.CartItem.user_id == user.id,
        models.CartItem.product_id == product_id
    ).first()

    if item:
        item.quantity += 1
    else:
        db.add(models.CartItem(
            user_id=user.id,
            product_id=product_id,
            quantity=1
        ))

    db.commit()
    return {"message": "Added to cart"}

# ---------------- DECREASE CART ----------------
@app.post("/api/cart/decrease/{product_id}")
def decrease_cart(
    product_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    item = db.query(models.CartItem).filter(
        models.CartItem.user_id == user.id,
        models.CartItem.product_id == product_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.quantity > 1:
        item.quantity -= 1
    else:
        db.delete(item)

    db.commit()
    return {"message": "Cart updated"}

# ---------------- GET CART ----------------
@app.get("/api/cart")
def get_cart(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    items = (
        db.query(models.CartItem, models.Product)
        .join(models.Product, models.CartItem.product_id == models.Product.id)
        .filter(models.CartItem.user_id == user.id)
        .all()
    )

    return [
        {
            "id": cart.id,
            "product_id": cart.product_id,
            "name": product.name,
            "price": product.price,
            "image": product.image,
            "quantity": cart.quantity,
            "username": user.username
        }
        for cart, product in items
    ]
