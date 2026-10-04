# Colour and font tokens. build.py emits them once for light and once for each dark selector.
FONTS = {
    "--display": '"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif',
    "--body": '"Public Sans", "Segoe UI", system-ui, sans-serif',
    "--mono": '"JetBrains Mono", ui-monospace, Consolas, monospace',
}
LIGHT = {"--bg": "#F1F3F2", "--surface": "#FFFFFF", "--ink": "#18211F", "--muted": "#5D6B67", "--line": "#D5DCD9",
         "--accent": "#0E6B66", "--accent-ink": "#FFFFFF", "--chip": "#E7ECEA",
         "--h1": "#B3541E", "--h2": "#8A6A00", "--h3": "#2E7D32", "--h4": "#00796B", "--h5": "#1565C0", "--h6": "#6A3FB5", "--h7": "#AD1457", "--h8": "#5D4037",
         "--warn": "#8A6A00", "--danger": "#B3261E"}
DARK = {"--bg": "#111816", "--surface": "#19221F", "--ink": "#E6EEEB", "--muted": "#9AA9A4", "--line": "#2C3834",
        "--accent": "#4FC2B9", "--accent-ink": "#0B1513", "--chip": "#22302C",
        "--h1": "#F0905A", "--h2": "#E2C04A", "--h3": "#7BCB7F", "--h4": "#4FC2B9", "--h5": "#7FB2F0", "--h6": "#B79BEB", "--h7": "#EE86B2", "--h8": "#C9A693",
        "--warn": "#E2C04A", "--danger": "#F2958E"}

def css():
    decl = lambda d: "; ".join(f"{k}:{v}" for k, v in d.items())
    dark = decl(DARK) + "; color-scheme:dark"
    return (f":root{{{decl(FONTS)}; {decl(LIGHT)}}}\n"
            f"@media (prefers-color-scheme: dark){{:root:not([data-theme=\"light\"]){{{dark}}}}}\n"
            f":root[data-theme=\"dark\"]{{{dark}}}\n")
