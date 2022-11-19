const withdrawFunction: () => Promise<void> = async () => {};

withdrawFunction()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
