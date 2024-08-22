const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const jsonArray = req.query.json ? JSON.parse(req.query.json) : null;
    const search = req.query.search;

    if (!jsonArray || !Array.isArray(jsonArray)) {
        return res.status(400).json({ error: "El parámetro 'json' es inválido o no es un array." });
    }

    if (!search) {
        return res.status(400).json({ error: "El parámetro 'search' es requerido." });
    }

    let foundResult = null;

    jsonArray.some((obj, index) => {
        if (typeof obj === 'object' && !Array.isArray(obj)) {
            for (const [key, value] of Object.entries(obj)) {
                if (value === search) {
                    foundResult = { key, index };
                    return true;
                }
            }
        } else if (Array.isArray(obj)) {
            if (obj.includes(search)) {
                foundResult = { position: index };
                return true;
            }
        } else if (obj === search) {
            foundResult = { position: index };
            return true;
        }
        return false;
    });

    if (foundResult) {
        res.json(foundResult);
    } else {
        res.status(404).json({ error: "El valor no se encontró en el array." });
    }
});

module.exports = router;