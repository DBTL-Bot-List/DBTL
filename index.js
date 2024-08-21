const express = require('express');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const app = express();
const routesPath = path.join(__dirname, 'routes');

function loadRoutes(basePath, baseRoute) {
    fs.readdirSync(basePath).forEach(fileOrFolder => {
        const fullPath = path.join(basePath, fileOrFolder);
        const route = `${baseRoute}/${fileOrFolder.replace('.js', '')}`;
        
        if (fs.statSync(fullPath).isDirectory()) {
            loadRoutes(fullPath, route);
        } else if (fileOrFolder.endsWith('.js')) {
            const router = require(fullPath);
            app.use(route, router);
        }
    });
}

loadRoutes(routesPath, '');

app.listen(3000, () => {
    console.log(`Ready!!!`);
});