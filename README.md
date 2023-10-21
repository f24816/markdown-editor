
# Editor Text folosind Rust

Acesta este un editor de documente făcut cu [Tauri](https://tauri.studio/en/), un framework pentru construirea de aplicații native cu tehnologii web și [html2pdf](https://github.com/ilaborie/html2pdf).

## Cerințe preliminare

- Instalați [Rust](https://www.rust-lang.org/tools/install)
- După instalare instalați un `toolchain` pentru Rust cu `rustup toolchain install stable`.

## Rulare

- Rulați `cargo tauri dev` pentru a rula aplicația în modul de dezvoltare.

## Compilare

- Compilați aplicația cu `cargo tauri build`.

Aceasta va compila aplicația și v-a crea un installer în `./src-tauri/target/release/bundle/msi/`.