// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![generate_pdf])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn generate_pdf(input: &str, output: &str) {
    use html2pdf::html_to_pdf;
    use headless_chrome::types::PrintToPdfOptions;
    use headless_chrome::LaunchOptions;
    use std::path::PathBuf;
    use std::time::Duration;

    // Use AsRef<Path>
    let input_path: PathBuf = input.into();
    let output_path: PathBuf = output.into();

    let pdf_options: PrintToPdfOptions = Default::default();
    let launch_options = LaunchOptions::default();
    let wait_duration = Some(Duration::from_secs(2));

    let result = html_to_pdf(input_path, output_path, pdf_options, launch_options, wait_duration);

    match result {
        Ok(()) => println!("PDF generated successfully!"),
        Err(err) => eprintln!("Error: {:?}", err),
    }
}
