# LA Crime Data Scrollytelling

A premium, interactive scrollytelling visualization of Los Angeles crime data from 2020 to the present. Built with **D3.js**, **Scrollama**, and **Leaflet**.

## Project Structure

-   `index.html`: Main entry point.
-   `style.css`: Styles for the sticky layout and dark mode theme.
-   `script.js`: Logic for D3 visualizations, map, and scroll interactions.
-   `crime_data_processed.json`: Pre-processed dataset (monthly counts, top crimes, map sample).
-   `vercel.json`: Configuration for Vercel deployment.

## Local Development

1.  Clone or download this repository.
2.  Because the project loads a local JSON file, you need a local server to avoid CORS errors.
    -   **Python**: Run `python -m http.server` in the project directory.
    -   **Node**: Run `npx serve`.
    -   **VS Code**: Use the "Live Server" extension.
3.  Open `http://localhost:8000` (or the port shown in your terminal).

## Deployment to Vercel

You can deploy this project to Vercel for free in minutes.

### Option 1: Using Vercel CLI (Recommended)

1.  Install Vercel CLI:
    ```bash
    npm i -g vercel
    ```
2.  Run the deploy command in this directory:
    ```bash
    vercel
    ```
3.  Follow the prompts (accept defaults).
4.  Your site will be deployed to a live URL (e.g., `https://viz3-yourname.vercel.app`).

### Option 2: Using GitHub

1.  Push this code to a GitHub repository.
2.  Log in to [Vercel](https://vercel.com).
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your GitHub repository.
5.  Vercel will automatically detect the static site. Click **"Deploy"**.

## Credits

-   Data: [City of Los Angeles Open Data Portal](https://data.lacity.org/)
-   Libraries: D3.js, Scrollama, Leaflet, OpenStreetMap, CARTO.
