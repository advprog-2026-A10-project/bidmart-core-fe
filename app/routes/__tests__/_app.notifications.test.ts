import { describe, expect, it, vi } from "vitest";

import { loader } from "../_app.notifications";

describe("notifications route guard loader", () => {
  it("allows navigation when notifications probe succeeds", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("http://localhost:5173/notifications");
    const result = await loader({ request } as never);

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestedUrl] = fetchMock.mock.calls[0] as [string];
    const parsed = new URL(requestedUrl);
    expect(parsed.pathname).toBe("/notifications");
    expect(parsed.searchParams.get("limit")).toBe("1");
  });

  it("redirects to auth login when notifications probe returns unauthorized", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("http://localhost:5173/notifications");

    try {
      await loader({ request } as never);
      throw new Error("Expected redirect to be thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
      const response = error as Response;
      expect(response.status).toBe(302);
      const location = response.headers.get("Location");
      expect(location).not.toBeNull();
      expect(location).toContain("/auth/login");
      expect(location).toContain("redirect=");
    }
  });
});
