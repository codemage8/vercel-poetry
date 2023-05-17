import execa from "execa";
import {
  version,
  shouldServe,
  installRequirement,
  installRequirementsFile as _installRequirementsFile,
  downloadFilesInWorkPath,
  build,
} from "@vercel/python";

import { debug, Meta } from "@vercel/build-utils";

interface InstallRequirementsFileArg {
  pythonPath: string;
  pipPath: string;
  filePath: string;
  workPath: string;
  meta: Meta;
  args?: string[];
}

async function pipInstall(pipPath: string, workPath: string, args: string[]) {
  const target = ".";
  // See: https://github.com/pypa/pip/issues/4222#issuecomment-417646535
  //
  // Disable installing to the Python user install directory, which is
  // the default behavior on Debian systems and causes error:
  //
  // distutils.errors.DistutilsOptionError: can't combine user with
  // prefix, exec_prefix/home, or install_(plat)base
  process.env.PIP_USER = "0";
  const cmdArgs = [
    "install",
    "--disable-pip-version-check",
    "--target",
    target,
    ...args,
  ];
  const pretty = `${pipPath} ${cmdArgs.join(" ")}`;
  debug(`Running "${pretty}"...`);
  try {
    await execa(pipPath, cmdArgs, {
      cwd: workPath,
    });
  } catch (err) {
    console.log(`Failed to run "${pretty}"`);
    throw err;
  }
}

async function installRequirementsFile({
  pythonPath,
  pipPath,
  filePath,
  workPath,
  meta,
  args,
}: InstallRequirementsFileArg): Promise<void> {
  // Before installation of requirement file, install poetry and generate requirements.txt file
  await pipInstall(pipPath, workPath, ["-U", "pip", "setuptools"]);
  await pipInstall(pipPath, workPath, ["-U", "poetry"]);

  const cmdArgs = [
    "export",
    "--without-hashes",
    "-f",
    "requirements.txt",
    "--output",
    filePath,
  ];

  // Export requirements.txt file before installation of requirements file
  await execa("poetry", cmdArgs, { cwd: workPath });

  return _installRequirementsFile({
    pythonPath,
    pipPath,
    filePath,
    workPath,
    meta,
    args,
  });
}
export {
  version,
  downloadFilesInWorkPath,
  shouldServe,
  installRequirement,
  installRequirementsFile,
  build,
};
