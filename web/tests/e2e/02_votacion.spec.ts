import { test, expect } from "@playwright/test";

test.describe("Flujo de Votación", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Login como socio
    await page.click("text=Conectar MetaMask");
  });

  test("P2.1 - Socio ve lista de propuestas disponibles", async ({ page }) => {
    await expect(page.locator("[data-testid='propuesta-card']")).toHaveCount.greaterThan(0);
  });

  test("P2.2 - Propuesta muestra información correcta", async ({ page }) => {
    const card = page.locator("[data-testid='propuesta-card']").first();
    await expect(card.locator("text=Por Discutir")).toBeVisible();
    await expect(card.locator("text=A FAVOR")).toBeVisible();
    await expect(card.locator("text=EN CONTRA")).toBeVisible();
    await expect(card.locator("text=ABSTENERME")).toBeVisible();
  });

  test("P2.3 - Votar A FAVOR sin pagar gas", async ({ page }) => {
    const card = page.locator("[data-testid='propuesta-card']").first();
    await card.locator("text=A FAVOR").click();

    // MetaMask debe mostrar "Firmar mensaje" (NO "Confirmar transacción")
    await expect(page.locator("text=Firmar mensaje")).toBeVisible();
    await page.click("text=Firmar");

    await expect(page.locator("text=Voto registrado")).toBeVisible();
  });

  test("P2.4 - No se puede votar dos veces", async ({ page }) => {
    const card = page.locator("[data-testid='propuesta-card']").first();
    await card.locator("text=A FAVOR").click();
    await page.click("text=Firmar");

    // Intentar votar de nuevo
    await expect(card.locator("text=Ya votaste")).toBeVisible();
    await expect(card.locator("text=A FAVOR")).toBeDisabled();
  });

  test("P2.5 - Voto es secreto (no se ve quién votó)", async ({ page }) => {
    const card = page.locator("[data-testid='propuesta-card']").first();
    await expect(card.locator("text=Votos a favor: 1")).toBeVisible();
    await expect(card.locator("text=Angel Lucci votó A FAVOR")).not.toBeVisible();
  });

  test("P2.6 - Propuesta no disponible no se puede votar", async ({ page }) => {
    const card = page.locator("[data-testid='propuesta-card']").filter({ hasText: "No disponible" }).first();
    await expect(card.locator("text=A FAVOR")).toBeDisabled();
  });

  test("P2.7 - Propuesta vencida no se puede votar", async ({ page }) => {
    const card = page.locator("[data-testid='propuesta-card']").filter({ hasText: "Votación cerrada" }).first();
    await expect(card.locator("text=A FAVOR")).toBeDisabled();
  });
});
