{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = [
    pkgs.bun
    pkgs.nodejs_22
  ];

  shellHook = ''
    echo "Frontend environment loaded (Bun & Node.js)."
    echo "Commands:"
    echo "  bun install  - Install dependencies"
    echo "  bun dev      - Start Next.js dev server"
  '';
}
