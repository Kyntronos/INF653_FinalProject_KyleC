const State = require('../model/States');

const getAllStates = async (req, res) => {
    const states = await State.find();
    if(!states) return res.status(204).json({'message': 'No states found.'});
    res.json(states);
}

const createNewState = async (req, res) => {
    if(!req?.body?.state || !req?.body?.slug) {
        return res.status(400).json({'message': 'State and slug are required'});
    }

    try {
        const result = await State.create({
            state: req.body.state,
            slug: req.body.slug
        });

        res.status(201).json(result);
    } catch (err){
        console.error(err);
    }
}

const updateState = async (req, res)=>{
    if(!req?.body?.code) {
        return response.status(400).json({'message': 'A state code is required.'});
    }

    const state = await State.findOne({ _code: req.body.code }).exec();
    if(!state){
        return res.status(204).json({'message': `No state matches code ${req.body.id}.`});
    }
    if(req.body?.state) state.state = req.body.state;
    if(req.body?.slug) state.state = req.body.slug;

    const result = await state.save();
    res.json(result);
}

const deleteState = async (req, res) => {
    if(!req?.body?.code) {
        return response.status(400).json({'message': 'A state code is required.'});
    }

    const state = await State.findOne({ _code: req.body.code }).exec();
    if(!state){
        return res.status(204).json({'message': `No state matches code ${req.body.id}.`});
    }

    const result = await state.deleteOne({ _code: req.body.code });
    res.json(result);
}

const getState = async (req, res) => {
    if(!req?.params?.code) {
        return response.status(400).json({'message': 'A state code is required.'});
    }

    const state = await State.findOne({ _code: req.params.code }).exec();
    if(!state){
        return res.status(204).json({'message': `No state matches code ${req.params.id}.`});
    }
    res.json(state);
}

module.exports = {
    getAllStates,
    createNewState,
    updateState,
    deleteState,
    getState
}