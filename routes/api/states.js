const express = require('express');
const router = express.Router();
const path = require('path');   //MAY NOT BE NEEDED
const statesController = require('../../controllers/statesController');


router.route('/')
    .get(statesController.getAllStates)
    .post(statesController.createNewState)
    .put(statesController.updateState)
    .delete(statesController.deleteState);

router.route('/:code')
    .get(statesController.getState);

module.exports = router;