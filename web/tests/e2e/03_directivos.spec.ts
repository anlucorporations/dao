import { test, expect } from "@playwright/test";

test.describe("Panel de Directivos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Login como Presidente
    await page.click("text=Conectar MetaMask");
  });

  test("P3.1 - Directivo ve panel administrativo", async ({ page }) => {
    await expect(page.locator("text=Panel Directivo")).toBeVisible();
    await expect(page.locator("text=Crear Propuesta")).toBeVisible();
  });

  test("P3.2 - Crear propuesta requiere 2FA", async ({ page }) => {
    await page.click("text=Crear Propuesta");
    await page.fill("[name='nombre']", "Compra de equipos");
    await page.fill("[name='descripcion']", "Comprar 5 computadoras para oficina");
    await page.fill("[name='monto']", "1000");
    await page.fill("[name='walletReceptora']", "0x1234567890abcdef...");
    await page.selectOption("[name='tipo']", "INVERSION");

    await page.click("text=Crear");
    await expect(page.locator("text=Código de autenticación requerido")).toBeVisible();

    await page.fill("[name='token2FA']", "123456");
    await page.click("text=Confirmar");

    await expect(page.locator("text=Propuesta creada")).toBeVisible();
  });

  test("P3.3 - Propuesta creada queda en estado BORRADOR", async ({ page }) => {
    await page.click("text=Crear Propuesta");
    // ... llenar formulario ...
    await page.click("text=Confirmar");

    await expect(page.locator("text=Estado: Borrador")).toBeVisible();
    await expect(page.locator("text=Esperando avales")).toBeVisible();
  });

  test("P3.4 - Firmar aval requiere 2FA", async ({ page }) => {
    await page.click("text=Propuestas Pendientes");
    await page.click("text=Firmar Aval").first();

    await expect(page.locator("text=Código de autenticación requerido")).toBeVisible();
  });

  test("P3.5 - Con 3 avales la propuesta se publica", async ({ page }) => {
    await page.click("text=Propuestas Pendientes");

    // Simular 3 firmas
    await page.click("text=Firmar Aval").nth(0);
    await page.fill("[name='token2FA']", "123456");
    await page.click("text=Confirmar");

    await page.click("text=Firmar Aval").nth(1);
    await page.fill("[name='token2FA']", "123456");
    await page.click("text=Confirmar");

    await page.click("text=Firmar Aval").nth(2);
    await page.fill("[name='token2FA']", "123456");
    await page.click("text=Confirmar");

    await expect(page.locator("text=Propuesta publicada")).toBeVisible();
    await expect(page.locator("text=Por Discutir")).toBeVisible();
  });

  test("P3.6 - Cambiar disponibilidad de propuesta", async ({ page }) => {
    await page.click("text=Gestionar Propuestas");
    await page.click("[data-testid='toggle-disponible']").first();

    await expect(page.locator("text=Disponibilidad actualizada")).toBeVisible();
  });

  test("P3.7 - No-directivo no ve panel administrativo", async ({ page }) => {
    // Simular login como socio normal
    await expect(page.locator("text=Panel Directivo")).not.toBeVisible();
  });
});
