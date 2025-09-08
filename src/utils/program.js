import ora from "ora";

export async function task(message, task, onError) {
  const spinner = ora(message).start();
  try {
    const result = await task();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail(`${message} ${error.message}`);
    if (onError) onError(error);
    else throw error;
  }
}
