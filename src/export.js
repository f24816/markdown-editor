async function getTempDir(html) {
    try {
        const tempDirPath = await tempdir();
        let tempFilePath = `${tempDirPath}file.html`;

        // Open a file dialog
        const selection = save({
            filters: [
                {
                    extensions: ["pdf"],
                    name: "*",
                },
            ],
        });

        // Save HTML file
        const createDataFile = async () => {
            try {
                await writeFile(
                    {
                        contents: html,
                        path: tempFilePath,
                    },
                    {
                        dir: BaseDirectory.Temp,
                    }
                );
            } catch (e) {
                console.log(e);
            }
        }; // Some boring error handling.
        createDataFile();

        // Invoke the command
        invoke("generate_pdf", {
            input: tempFilePath,
            output: await selection,
        })
            .then((res) => {
                // Show a popup for 3 seconds to indicate that the file has been exported.
                document.getElementById("popup").style.display = "block";
                document.getElementById("popup").style.opacity = "1";
                document.getElementById("popup").style.transition = "none";

                // Wait 1 second
                setTimeout(function () {
                    document.getElementById("popup").style.transition =
                        "opacity 1s ease-out";
                    document.getElementById("popup").style.opacity = "0";
                }, 2000);
                setTimeout(function () {
                    document.getElementById("popup").style.display = "none";
                }, 3000);
            })
            .catch((err) => {
                // Show error in console
                console.error("Error:", err);
            });
    } catch (error) {
        // Show error in console
        console.error("Error:", error);
    }
}