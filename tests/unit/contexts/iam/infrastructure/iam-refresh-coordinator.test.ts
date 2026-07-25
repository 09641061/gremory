import { coordinateRefresh } from "@/contexts/iam/infrastructure/session/iam-refresh-coordinator";

describe("coordinateRefresh", () => {
  it("shares an in-flight rotation between concurrent requests", async () => {
    let complete:
      | ((session: { accessToken: string; refreshToken: string }) => void)
      | undefined;
    const refresh = vi.fn(
      () =>
        new Promise<{ accessToken: string; refreshToken: string }>((resolve) => {
          complete = resolve;
        }),
    );

    const first = coordinateRefresh("concurrent-refresh", refresh);
    const second = coordinateRefresh("concurrent-refresh", refresh);
    complete?.({ accessToken: "access", refreshToken: "rotated" });

    await expect(Promise.all([first, second])).resolves.toEqual([
      { accessToken: "access", refreshToken: "rotated" },
      { accessToken: "access", refreshToken: "rotated" },
    ]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("briefly reuses a completed rotation for requests carrying the old cookie", async () => {
    const refresh = vi.fn().mockResolvedValue({
      accessToken: "access",
      refreshToken: "rotated",
    });

    const first = await coordinateRefresh("recent-refresh", refresh);
    const second = await coordinateRefresh("recent-refresh", refresh);

    expect(second).toEqual(first);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
