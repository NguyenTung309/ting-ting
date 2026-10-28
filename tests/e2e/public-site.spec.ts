import { expect, test } from "@playwright/test";

test.setTimeout(60000);

test("navigates through the five public sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Nói về tiền/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toHaveCount(0);
  await expect(page.getByText("Bắt đầu ngay")).toHaveCount(0);

  for (const route of ["/ve-du-an", "/test-xu-huong-tai-chinh", "/tuong-thich-doi", "/blog"]) {
    await page.goto(route);
    await expect(page.locator("header")).toBeVisible();
  }
});

test("completes the finance test", async ({ page }) => {
  await page.goto("/test-xu-huong-tai-chinh");
  await page.getByLabel("Tên của bạn").fill("Minh");
  await page.getByRole("button", { name: /Bắt đầu khám phá/ }).click();

  for (let index = 0; index < 22; index += 1) {
    await page.locator('button[aria-pressed="false"]').first().click();
    await page.getByRole("button", { name: index === 21 ? /Xem kết quả/ : /Tiếp tục/ }).click({ force: true });
    if (index < 21) await expect(page.getByText(new RegExp(`CÂU ${String(index + 2).padStart(2, "0")} / 22`))).toBeVisible();
  }

  await expect(page.getByText("Kết quả của bạn")).toBeVisible({ timeout: 30000 });
  const hero = page.getByTestId("result-hero");
  await expect(hero).toBeVisible();
  await expect(hero.getByRole("heading")).toBeVisible();
  const heroBox = await hero.boundingBox();
  const detailsBox = await page.getByTestId("result-details").boundingBox();
  expect(heroBox).not.toBeNull();
  expect(detailsBox).not.toBeNull();
  expect((detailsBox?.y || 0)).toBeGreaterThan((heroBox?.y || 0) + (heroBox?.height || 0) - 12);
  await expect(page.getByTestId("result-journey").getByRole("link", { name: /So sánh với nửa kia/ })).toHaveAttribute("href", "/tuong-thich-doi");
  await expect(page.getByTestId("result-journey").getByRole("link", { name: /Khám phá người tương tự/ })).toHaveCount(0);
});

test("completes the couple compatibility test", async ({ page }) => {
  async function completeFinance(name: string) {
    await page.goto("/test-xu-huong-tai-chinh");
    await page.getByLabel("Tên của bạn").fill(name);
    await page.getByRole("button", { name: /Bắt đầu khám phá/ }).click();
    for (let index = 0; index < 22; index += 1) {
      await page.locator('button[aria-pressed="false"]').first().click();
      await page.getByRole("button", { name: index === 21 ? /Xem kết quả/ : /Tiếp tục/ }).click({ force: true });
      if (index < 21) await expect(page.getByText(new RegExp(`CÂU ${String(index + 2).padStart(2, "0")} / 22`))).toBeVisible();
    }
    return (await page.getByRole("link", { name: /^TTT-[A-Z2-9]{5}$/ }).first().textContent())?.trim() || "";
  }

  const codeA = await completeFinance("Minh");
  await page.getByRole("button", { name: "Làm lại" }).click();
  const codeB = await completeFinance("An");
  await page.goto("/tuong-thich-doi");
  await page.getByLabel("Mã TTT của bạn").fill(codeA);
  await page.getByLabel("Mã TTT của người ấy").fill(codeB);
  await page.getByRole("button", { name: /Khám phá tương thích/ }).click();
  await expect(page.getByText("Hai bạn gặp nhau ở")).toBeVisible({ timeout: 30000 });
  await page.goto(`/ket-qua/${codeA}`);
  await expect(page.getByTestId("result-hero")).toBeVisible();
  await expect(page.getByTestId("result-journey")).toBeVisible();
});

test("browses the 15-trend library and detail page", async ({ page }) => {
  await page.goto("/kho-tang-tinh-cach");
  await expect(page.getByRole("main").getByText("Kho tàng tính cách", { exact: true })).toBeVisible();
  await expect(page.locator('a[href^="/kho-tang-tinh-cach/"]')).toHaveCount(15);
  await page.locator('a[href^="/kho-tang-tinh-cach/"]').first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Điểm nổi bật")).toBeVisible();
});

test("filters the blog and opens a related article", async ({ page }) => {
  await page.goto("/blog?category=Tài chính");
  await expect(page.getByRole("heading", { name: /Những câu chuyện/ })).toBeVisible();
  await expect(page.getByText("Tiền bạc cũng là một câu chuyện về cảm xúc")).toBeVisible();
  await page.getByRole("link", { name: /Tiền bạc cũng là một câu chuyện/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Tiền bạc cũng là một câu chuyện/ })).toBeVisible();
  await expect(page.getByText("Bài viết liên quan")).toBeVisible();
});

test("shows clear states for an invalid result code", async ({ page }) => {
  await page.goto("/ket-qua/TTT-AAAAA");
  await expect(page.getByText("Chưa tìm thấy kết quả này.")).toBeVisible();
  await page.goto("/tuong-thich-doi");
  await page.getByLabel("Mã TTT của bạn").fill("not-a-code");
  await page.getByLabel("Mã TTT của người ấy").fill("TTT-AAAAA");
  await page.getByRole("button", { name: /Khám phá tương thích/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: /dạng TTT/ })).toBeVisible();
});
