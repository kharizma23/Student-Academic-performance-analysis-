from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///./student_platform.db"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "supersecretkey"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    debug: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
