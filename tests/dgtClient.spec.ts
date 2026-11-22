import { afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { DgtClient, dgtClient } from "../src/dgtClient.js";
import { handleGetUsdToCrcRate } from "../src/helpers/getUsdToCrcRate.js";

void describe("dgtClient", () => {
  const client = new DgtClient();

  beforeEach(() => {
    client.clearCache();
    dgtClient.clearCache();
  });

  afterEach(() => {
    mock.restoreAll();
  });

  void it("returns current USD to CRC bid and selling rates", async () => {
    void mock.method(globalThis, "fetch", (input: string | URL | Request) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const requestUrl = new URL(url);

      assert.equal(requestUrl.pathname, "/indicadores/tc/dolar");
      assert.equal(requestUrl.search, "");

      return new Response(
        JSON.stringify({
          compra: { fecha: "2026-11-21", valor: 505.12 },
          venta: { fecha: "2026-11-21", valor: 511.45 },
        }),
        { status: 200 }
      );
    });

    const result = await client.getUsdToCrcRate();
    assert.deepEqual(result, {
      date: "2026-11-21",
      currency: "USD",
      targetCurrency: "CRC",
      bid: 505.12,
      selling: 511.45,
    });
  });

  void it("returns historical USD to CRC rate for a specific date", async () => {
    void mock.method(globalThis, "fetch", (input: string | URL | Request) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const requestUrl = new URL(url);

      assert.equal(requestUrl.pathname, "/indicadores/tc/dolar/historico");
      assert.equal(requestUrl.searchParams.get("d"), "2026-10-15");
      assert.equal(requestUrl.searchParams.get("h"), "2026-10-15");

      return new Response(
        JSON.stringify([
          { fecha: "2026-10-14", compra: 501.5, venta: 508.0 },
          { fecha: "2026-10-15", compra: 502.5, venta: 509.0 },
        ]),
        { status: 200 }
      );
    });

    const result = await client.getUsdToCrcRate("2026-10-15");
    assert.equal(result.bid, 502.5);
    assert.equal(result.selling, 509.0);
    assert.equal(result.date, "2026-10-15");
  });

  void it("serves repeated requests from cache without calling fetch twice", async () => {
    const fetchMock = mock.method(globalThis, "fetch", () => {
      return new Response(
        JSON.stringify({
          compra: { fecha: "2026-11-21", valor: 505.0 },
          venta: { fecha: "2026-11-21", valor: 511.0 },
        }),
        { status: 200 }
      );
    });

    await client.getUsdToCrcRate();
    await client.getUsdToCrcRate();

    assert.equal(fetchMock.mock.callCount(), 1);
  });

  void it("keeps caches isolated between client instances", async () => {
    const fetchMock = mock.method(globalThis, "fetch", () => {
      return new Response(
        JSON.stringify({
          compra: { fecha: "2026-11-21", valor: 505.0 },
          venta: { fecha: "2026-11-21", valor: 511.0 },
        }),
        { status: 200 }
      );
    });

    await client.getUsdToCrcRate();
    await new DgtClient().getUsdToCrcRate();

    assert.equal(fetchMock.mock.callCount(), 2);
  });

  void it("throws descriptive error on HTTP 429 rate limit", async () => {
    void mock.method(globalThis, "fetch", () => {
      return new Response("Too Many Requests", { status: 429 });
    });

    await assert.rejects(
      () => client.getUsdToCrcRate(),
      /Rate limit exceeded on DGT API \(HTTP 429\)/
    );
  });

  void it("throws a clear error when no historical rate is returned", async () => {
    void mock.method(globalThis, "fetch", () => {
      return new Response("[]", { status: 200 });
    });

    await assert.rejects(
      () => client.getUsdToCrcRate("2026-10-15"),
      /No exchange rate data found for date 2026-10-15/
    );
  });

  void it("rejects malformed current API responses", async () => {
    void mock.method(globalThis, "fetch", () => {
      return new Response(JSON.stringify({ compra: "505.12", venta: null }), { status: 200 });
    });

    await assert.rejects(
      () => client.getUsdToCrcRate(),
      /Unexpected response structure from DGT API/
    );
  });

  void it("returns an MCP-shaped error result when the API request fails", async () => {
    void mock.method(globalThis, "fetch", () => {
      return new Response("Unavailable", { status: 503 });
    });

    const result = await handleGetUsdToCrcRate();
    const [content] = result.content;
    assert.equal(result.isError, true);
    assert.ok(content);
    assert.match(content.text, /HTTP 503/);
  });
});
