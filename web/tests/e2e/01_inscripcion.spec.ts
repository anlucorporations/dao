import { test, expect } from "@playwright/test";

test.describe("Flujo de Inscripción de Socio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("P1.1 - Página de inicio carga correctamente", async ({ page }) => {
    await expect(page).toHaveTitle(/Cooperativa Los Cappones/);
    await expect(page.locator("text=Conectar MetaMask")).toBeVisible();
  });

  test("P1.2 - Tutorial de MetaMask se muestra para nuevos usuarios", async ({ page }) => {
    await page.click("text=¿Necesitas ayuda?");
    await expect(page.locator("text=Paso 1: Instalar MetaMask")).toBeVisible();
    await expect(page.locator("text=Paso 2: Crear tu wallet")).toBeVisible();
    await expect(page.locator("text=Paso 3: Conectar a la plataforma")).toBeVisible();
  });

  test("P1.3 - Socio nuevo puede conectar wallet", async ({ page }) => {
    // Simular conexión de MetaMask (en test real se usa mock o extensión)
    await page.click("text=Conectar MetaMask");
    await expect(page.locator("text=Wallet conectada")).toBeVisible();
  });

  test("P1.4 - No-socio ve mensaje de inscripción requerida", async ({ page }) => {
    await page.click("text=Conectar MetaMask");
    // Simular wallet no registrada
    await expect(page.locator("text=Aun no eres socio")).toBeVisible();
    await expect(page.locator("text=Solicitar inscripción")).toBeVisible();
  });

  test("P1.5 - Socio activo ve dashboard con propuestas", async ({ page }) => {
    await page.click("text=Conectar MetaMask");
    // Simular wallet registrada
    await expect(page.locator("text=Bienvenido")).toBeVisible();
    await expect(page.locator("text=Propuestas Activas")).toBeVisible();
  });
});
