const depositFunction: () => Promise<void> = async () => {};

depositFunction()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
