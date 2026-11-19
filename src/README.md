# Frontend source map

The source is organized by application responsibility and project workspace.

- `App.jsx` is the top-level workspace switch. It sends the user to the project home, an unfinished-workspace message, or the implemented Value chain / Baseline workspace.
- `app/categories.js` is the category and subcategory catalog used by the home screen.
- `features/home/` contains the project home page and category dropdowns.
- `features/workspaces/` contains the shared placeholder for subcategories that are planned but not built yet.
- `features/value-chain/baseline/` contains the currently implemented Map View, Database, and Questionnaire, plus their shared components, data, and API services.
- `main.jsx` mounts the application; `index.css` holds the shared visual styles.

To add a category or subcategory, update `app/categories.js`. To build a future subcategory, create its feature folder and replace the placeholder selection in `App.jsx` with that workspace.
