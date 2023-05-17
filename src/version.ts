import { NowBuildError } from '@vercel/build-utils';

interface PythonVersion {
  version: string;
  pipPath: string;
  pythonPath: string;
  runtime: string;
  discontinueDate?: Date;
}

// The order must be most recent first
const allOptions: PythonVersion[] = [
  {
    version: '3.9',
    pipPath: 'pip3.9',
    pythonPath: 'python3.9',
    runtime: 'python3.9',
  },
  {
    version: '3.6',
    pipPath: 'pip3.6',
    pythonPath: 'python3.6',
    runtime: 'python3.6',
    discontinueDate: new Date('2022-07-18'),
  },
];

function getDevPythonVersion(): PythonVersion {
  // Use the system-installed version of `python3` when running `vercel dev`
  return {
    version: '3',
    pipPath: 'pip3',
    pythonPath: 'python3',
    runtime: 'python3',
  };
}
export function getLatestPythonVersion({
  isDev,
}: {
  isDev?: boolean;
}): PythonVersion {
  if (isDev) {
    return getDevPythonVersion();
  }
  return allOptions[0];
}

export function getSupportedPythonVersion({
  isDev,
  pipLockPythonVersion,
}: {
  isDev?: boolean;
  pipLockPythonVersion: string | undefined;
}): PythonVersion {
  if (isDev) {
    return getDevPythonVersion();
  }
  let selection = getLatestPythonVersion({ isDev: false });

  if (typeof pipLockPythonVersion === 'string') {
    const found = allOptions.find(o => o.version === pipLockPythonVersion);
    if (found) {
      selection = found;
    } else {
      console.warn(
        `Warning: Python version "${pipLockPythonVersion}" detected in Pipfile.lock is invalid and will be ignored. http://vercel.link/python-version`
      );
    }
  }

  if (isDiscontinued(selection)) {
    throw new NowBuildError({
      code: 'BUILD_UTILS_PYTHON_VERSION_DISCONTINUED',
      link: 'http://vercel.link/python-version',
      message: `Python version "${selection.version}" detected in Pipfile.lock is discontinued and must be upgraded.`,
    });
  }

  if (selection.discontinueDate) {
    const d = selection.discontinueDate.toISOString().split('T')[0];
    console.warn(
      `Error: Python version "${selection.version}" detected in Pipfile.lock has reached End-of-Life. Deployments created on or after ${d} will fail to build. http://vercel.link/python-version`
    );
  }

  return selection;
}

function isDiscontinued({ discontinueDate }: PythonVersion): boolean {
  const today = Date.now();
  return discontinueDate !== undefined && discontinueDate.getTime() <= today;
}
