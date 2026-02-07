import os

from app.core.constants import Constants
from loguru import logger


class Config:
    """
    Configuration class for the application.
    Loads environment variables and sets default values for all configurations.
    """
    DEBUG: bool = os.getenv("DEBUG", Constants.DEBUG) == "true"

    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", Constants.DEFAULT_POSTGRES_HOST)
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", Constants.DEFAULT_POSTGRES_PORT)
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", Constants.DEFAULT_POSTGRES_USER)
    POSTGRES_PASSWORD: str = os.getenv(
        "POSTGRES_PASSWORD", Constants.DEFAULT_POSTGRES_PASSWORD
    )
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", Constants.DEFAULT_POSTGRES_DB)

    POSTGRES_URL: str = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")


logger.info("Loading application configuration...")
logger.info(f"DEBUG mode: {Config.DEBUG}")
logger.info(f"Database host: {Config.POSTGRES_HOST}:{Config.POSTGRES_PORT}")
logger.info(f"Database user: {Config.POSTGRES_USER}")
logger.info(f"Database name: {Config.POSTGRES_DB}")

if Config.POSTGRES_PASSWORD:
    logger.debug("POSTGRES_PASSWORD is set.")
else:
    logger.warning("POSTGRES_PASSWORD is not set.")

logger.info("Configuration loading complete.")
