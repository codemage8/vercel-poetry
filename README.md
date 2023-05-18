# VERCEL-POETRY

A helper to deploy poetry based python api server project.

Most of the codes are copied from [Vercel's Python Package](https://github.com/vercel/vercel/tree/main/packages/python).

This module imitates the behavior of [@vercel/python](https://www.npmjs.com/package/@vercel/python) package.

## Usage

Use this module in your `builds` option in `vercel.json`.

Check [vercel-poetry-test](https://github.com/zilinj88/vercel-poetry-test/blob/main/vercel.json) repository to see the examples

```json
{
  ...
  "builds": [
    {
      "src": "api/main.py", // The file containing the main app (e.g. FastAPI)
      "use": "@devjin8/vercel-poetry@latest"
    }
  ],
  // place custom redirects / rewrites here
}
```


## How does this work?

The original `@vercel/python` package installs dependencies from `requirements.txt` into the current working path in the build process.

This module updated the behavior building process as the followings.

1. Removed `Pipfile.lock` file check.

2. Install the `setuptools` and `poetry` module using current python environment. (Check [Installing Poetry Manually](https://python-poetry.org/docs/#installing-manually).)
    
    Code is [here](https://github.com/zilinj88/vercel-poetry/blob/d5885db5ed28d9f3f3142f6cd81004d47355a982/src/index.ts#L57-L58)

3. Creates the `requirements.txt` file using the following command.

   ```bash
   python -m poetry export --without-hashes -f requirements.txt --output requirements.txt
   ```

    Code is [here](https://github.com/zilinj88/vercel-poetry/blob/d5885db5ed28d9f3f3142f6cd81004d47355a982/src/index.ts#L60-L72)


## vc_init.py

The exact copy of `vc_init.py` at https://github.com/vercel/vercel/blob/main/packages/python/vc_init.py

### Explanation

This file will be written as `vc__handler__python.py` in work directory and will be the main entry file of web app.

It checks our `app` (Django/Flask/FastAPI) or `handler` (which are defined as entry point in `vercel.json` file), and run WSGI, ASGI or Basic HTTP Server.

