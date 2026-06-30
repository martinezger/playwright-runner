import { test, expect } from '@playwright/test'

const BASE_URL = "https://www.google.com"

test.describe("Suite 1", () => {

  test("Test 1", async ({ page }) => {
    await page.goto(BASE_URL + "/")
  })
})
