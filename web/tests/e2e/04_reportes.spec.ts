import { test, expect } from "@playwright/test";

test.describe("Reportes y Actas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("text=Conectar MetaMask");
  });

  test("P4.1 - Generar acta al cerrar votación", async ({ page }) => {
    await page.click("text=Reportes");
    await page.click("text=Generar Acta").first();

    await expect(page.locator("text=Acta generada")).toBeVisible();
    await expect(page.locator("text=Hash en blockchain")).toBeVisible();
    await expect(page.locator("text=Descargar PDF")).toBeVisible();
  });

  test("P4.2 - Verificar autenticidad de acta", async ({ page }) => {
    await page.click("text=Verificar Acta");
    await page.fill("[name='hash']", "0xabc123...");
    await page.click("text=Verificar");

    await expect(page.locator("text=Acta verificada")).toBeVisible();
    await expect(page.locator("text=Propuesta #5")).toBeVisible();
  });

  test("P4.3 - Reporte de balance general", async ({ page }) => {
    await page.click("text=Reportes");
    await page.click("text=Balance General");

    await expect(page.locator("text=Capital Total")).toBeVisible();
    await expect(page.locator("text=Socios activos")).toBeVisible();
  });

  test("P4.4 - Reporte de movimientos", async ({ page }) => {
    await page.click("text=Reportes");
    await page.click("text=Movimientos");

    await expect(page.locator("text=Entradas")).toBeVisible();
    await expect(page.locator("text=Salidas")).toBeVisible();
  });
});
