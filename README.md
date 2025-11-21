# 🏆 Project Delivery Specification: TypeScript CSV Data Explorer

This project demonstrates expertise in **TypeScript Typing**, **Browser APIs**, **Asynchronous Programming**, and **Clean UI Architecture**.

This project demonstrates expertise in TypeScript Typing, Browser APIs, Asynchronous Programming, and Clean UI Architecture.

📦 Submission Requirements (Mandatory)

The final deliverable must adhere to the following professional standards:

* Git Repository: The candidate must create a public or private Git repository (e.g., on GitHub, GitLab, or Bitbucket) containing all source code.

* Invitation: The candidate must send an invitation or link to the reviewer to grant access to the repository.

* Setup Documentation: The repository must include a clear, professional README.md file detailing the installation and development setup instructions.

## 🛡️ Core Requirements (Must-Do)

| Feature                           | Description                                                                                                                                           | Key Technologies Demonstrated                     | TypeScript Requirement                                                                                                  |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| **File Handling & Typed Parsing** | User uploads a CSV. Use `Papa Parse` with the **`File` object** for parsing. The output must be converted into a **strongly-typed array of objects**. | `Papa Parse`, `File` API, Async/Await             | **Define `interface CSVRow`** for data integrity. Use `@types/papaparse`.                                               |
| **Dynamic Table Rendering**       | Render the typed data into a semantic `<table>`. Use the object keys (headers) to build the `<th>` elements.                                          | DOM manipulation, `map`/`forEach`, Semantic HTML  | Rendering function must accept and process only **`CSVRow[]`** data.                                                    |
| **Type-Safe Column Sorting**      | Implement a stable, multi-state sort (Asc/Desc/None) when headers are clicked. Must handle both **string and numeric** data types safely.             | Event Listeners, `Array.sort()`, State Management | Use a **Type Guard** or explicit checking for sorting logic. Define a **`SortState` type** (e.g., `'asc'                | 'desc' | 'none'`). |
| **Architectural Separation**      | Organize the application logic into distinct, modular components (Classes or Modules).                                                                | OOP/Modular JavaScript                            | Implement using **two or more classes** (e.g., `FileHandler` and `TableRenderer`) for clear **Separation of Concerns**. |

### ✨ High-Value Polish

These features will make the project stand out by demonstrating attention to UX and robustness.

1. **Robust Error Handling:**

      * **File Errors:** Catch errors related to file type (`.csv` only) and file size.
      * **Parse Errors:** Use Papa Parse's error callback to display a friendly message if data is malformed.
      * *TS Polish:* Use `try...catch` blocks with explicit error type annotations (e.g., `(error: Error)`) where possible.

2. **Advanced UX & Visual Feedback:**

      * Show a brief **"Processing Data..."** indicator during the asynchronous parsing phase.
      * Visually highlight the sorted column and display the sort direction indicator ($\uparrow / \downarrow$).

3. **Code Quality & Tooling:**

      * Use a modern **`tsconfig.json`** setup (e.g., targeting ES2020).
      * Ensure consistency with a lightweight formatter/linter (e.g., Prettier).
