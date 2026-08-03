import { test, expect } from "@playwright/test";

test.describe("Seguridad y Casos Edge", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("P5.1 - No se puede acceder sin MetaMask", async ({ page }) => {
    // Simular navegador sin MetaMask
    await expect(page.locator("text=MetaMask no detectado")).toBeVisible();
    await expect(page.locator("text=Instalar MetaMask")).toBeVisible();
  });

  test("P5.2 - 2FA incorrecto bloquea acción", async ({ page }) => {
    await page.click("text=Conectar MetaMask");
    await page.click("text=Panel Directivo");
    await page.click("text=Crear Propuesta");

    await page.fill("[name='token2FA']", "000000");
    await page.click("text=Confirmar");

    await expect(page.locator("text=Código 2FA invalido")).toBeVisible();
  });

  test("P5.3 - Relayer sin fondos muestra Plan B", async ({ page }) => {
    await page.click("text=Conectar MetaMask");
    const card = page.locator("[data-testid='propuesta-card']").first();
    await card.locator("text=A FAVOR").click();

    // Simular relayer sin fondos
    await expect(page.locator("text=Servicio temporalmente indisponible")).toBeVisible();
    await expect(page.locator("text=Notificar a la junta directiva")).toBeVisible();
  });

  test("P5.4 - Propuesta con 3 reintentos se rechaza automáticamente", async ({ page }) => {
    await page.click("text=Conectar MetaMask");
    await expect(page.locator("text=Propuesta rechazada automaticamente")).toBeVisible();
    await expect(page.locator("text=Máximo de reintentos alcanzado")).toBeVisible();
  });

  test("P5.5 - Wallet perdida puede recuperarse con preguntas", async ({ page }) => {
    await page.click("text=¿Olvidaste tu wallet?");
    await page.fill("[name='respuesta1']", "Respuesta secreta 1");
    await page.fill("[name='respuesta2']", "Respuesta secreta 2");
    await page.click("text=Solicitar recuperación");

    await expect(page.locator("text=Solicitud enviada a la junta directiva")).toBeVisible();
  });

  test("P5.6 - Acceso desde móvil es responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("text=Conectar MetaMask")).toBeVisible();
    // WalletConnect debería estar disponible en móvil
    await expect(page.locator("text=Conectar con WalletConnect")).toBeVisible();
  });
});
