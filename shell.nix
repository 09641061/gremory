{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = [
    pkgs.bun
    pkgs.nodejs_22
    pkgs.chromium
  ];

  shellHook = ''
    export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
    export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="${pkgs.chromium}/bin/chromium"
    echo "Frontend environment loaded (Bun, Node.js & Chromium)."
    echo "Commands:"
    echo "  bun install  - Install dependencies"
    echo "  bun dev      - Start Next.js dev server"
  '';
}
