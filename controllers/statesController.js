const State = require('../model/States');
const stateData = require('../model/statesData.json');
const verifyStates = require('../middleware/verifyStates');


const getAllStates = async (req, res) => {
    try {
        //console.log("statesData:", stateData);
        // Load all funfacts from MongoDB
        const mongoStates = await State.find();

        // Create a map from stateCode to funfacts
        const funfactsMap = {};
        mongoStates.forEach(state => {
            funfactsMap[state.stateCode] = state.funfacts;
        });
      
        //Filtering on contiguity
        let filteredStates = stateData;
        if(req.query?.contig === 'true'){
          filteredStates = stateData.filter(st => st.code !== 'AK' && st.code !== 'HI');
        } else if (req.query?.contig === 'false'){
          filteredStates = stateData.filter(st => st.code === 'AK' || st.code === 'HI');
        }

        // Merge funfacts into statesData
        const mergedStates = filteredStates.map(state => {
            const funfacts = funfactsMap[state.code];
            return funfacts ? { ...state, funfacts } : state;
        });

        res.json(mergedStates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Error' });
    }
};



const createNewState = async (req, res) => {
    if (!req?.body?.stateCode) {
        return res.status(400).json({ 'message': 'stateCode is required.' });
    }

    try {
        const result = await State.create({
            stateCode: req.body.stateCode.toUpperCase(),
            funfacts: req.body.funfacts || []
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error creating state data.' });
    }
};


const updateState = async (req, res)=>{
    if(!req?.body?.code) {
        return res.status(400).json({'message': 'A state code is required.'});
    }

    const state = await State.findOne({ stateCode: req.body.code.toUpperCase() }).exec();
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
        return res.status(400).json({'message': 'A state code is required.'});
    }

    const state = await State.findOne({ stateCode: req.body.code.toUpperCase() }).exec();
    if(!state){
        return res.status(204).json({'message': `No state matches code ${req.body.id}.`});
    }

    const result = await state.deleteOne({ stateCode: req.body.code.toUpperCase() });
    res.json(result);
}


const getState = async (req, res) => {
    const stateCode = req.code; // Set by verifyStates middleware

    // Find the base state info from statesData.json
    const foundState = stateData.find(st => st.code === stateCode);
    if (!foundState) {
        return res.status(404).json({ message: `State code ${stateCode} not found.` });
    }

    try {
        // Try to find any funfacts from MongoDB
        const mongoState = await State.findOne({ stateCode }).exec();

        // Merge funfacts if present
        const responseState = mongoState?.funfacts?.length
            ? { ...foundState, funfacts: mongoState.funfacts }
            : foundState;

        res.json(responseState);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Error' });
    }
};

const getFunFact = async (req, res) => {
    const stateCode = req.code; // From verifyStates
    const fullState = stateData.find(state => state.code === stateCode);

    try {
        const mongoState = await State.findOne({ stateCode }).exec();

        if (!mongoState || !mongoState.funfacts || mongoState.funfacts.length === 0) {
            return res.status(404).json({ message: `No Fun Facts found for ${fullState.state}` });
        }

        const randomIndex = Math.floor(Math.random() * mongoState.funfacts.length);
        const funfact = mongoState.funfacts[randomIndex];

        res.json({ funfact });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Error' });
    }
};

const getCapital = (req, res) => {
    const stateCode = req.code;

    // Find the state object in the JSON file
    const state = stateData.find(st => st.code === stateCode);

    if (!state) {
        return res.status(404).json({ message: 'State not found.' });
    }

    res.json({ state: state.state, capital: state.capital_city });
};

const getNickname = (req, res) => {
    const stateCode = req.code;
  
    //Find the state object in the files
    const state = stateData.find(st => st.code === stateCode);
  
    if(!state){
      return res.status(400).json({message: 'State not found.'});
    }
  
    res.json({state: state.state, nickname: state.nickname });
};

const getPopulation = (req, res) => {
    const stateCode = req.code;
  
    //Find the state...
    const state = stateData.find(st => st.code === stateCode);
  
    if(!state){
      return res.status(400).json({message: 'State not found.'});
    }
  
    res.json({state: state.state, population: state.population.toLocaleString() });
}

const getAdmission = (req, res) => {
    const stateCode = req.code;
  
    //Finding the state...
    const state = stateData.find(st => st.code === stateCode);
  
    if(!state){
      return res.status(400).json({message: 'State not found.'});
    }
  
    res.json({state: state.state, admitted: state.admission_date });
}

const postFunFact = async (req, res) => {
    const stateCode = req.code;
    const funfacts = req.body.funfacts;
  
    if(!funfacts){
      return res.status(400).json({message: 'State fun facts value required' });
    }
  
    if(!Array.isArray(funfacts)) {
      return res.status(400).json({ message: 'State fun facts value must be an array' });
    }
  
    try {
      let state = await State.findOne({stateCode}).exec();
      
      if(!state){
        state = await State.create({ stateCode, funfacts });
      } else {
        state.funfacts.push(...funfacts);
        await state.save();
      }
      
      res.status(201).json(state);
      
    } catch (err) {
      console.error(err);
      res.status(500).json({message: 'Internal Error' });
    }
};

const patchFunFact = async (req, res) => {
    const stateCode = req.code;
    const { index, funfact } = req.body;
    const fullState = stateData.find(state => state.code === stateCode);
  
    if(index === undefined) {
      return res.status(400).json({ message: 'State fun fact index value required'});
    } else if (funfact === undefined){
      return res.status(400).json({ message: 'State fun fact value required'});
    }
  
    try {
      const state = await State.findOne({ stateCode }).exec();
      
      if(!state || !state.funfacts || state.funfacts.length === 0) {
        return res.status(400).json({message: `No Fun Facts found for ${fullState.state}`});
      }
      
      if(index > state.funfacts.length) {
        return res.status(400).json({message: `No Fun Fact found at that index for ${fullState.state}`});
      }
      
      state.funfacts[index - 1] = funfact;
      await state.save();
      
      res.json(state);
      
    } catch (err) {
      console.error(err);
      res.status(500).json({message: 'Internal Error'});
    }
};

const deleteFunFact = async (req, res) => {
    const stateCode = req.code;
    const { index } = req.body;
    const fullState = stateData.find(state => state.code === stateCode);
  
    if(index === undefined) {
      return res.status(400).json({ message: 'State fun fact index value required'});
    } 
  
    try {
      const state = await State.findOne({ stateCode }).exec();
      
      if(!state || !state.funfacts || state.funfacts.length === 0) {
        return res.status(400).json({message: `No Fun Facts found for ${fullState.state}`});
      }
      
      if(index > state.funfacts.length) {
        return res.status(400).json({message: `No Fun Fact found at that index for ${fullState.state}`});
      }
      
      state.funfacts.splice(index - 1, 1);
      await state.save();
      
      res.json(state);
      
    } catch (err) {
      console.error(err);
      res.status(500).json({message: 'Internal Eerror'});
    }
};

module.exports = {
    getAllStates,
    createNewState,
    updateState,
    deleteState,
    getState,
    getFunFact,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    postFunFact,
    patchFunFact,
    deleteFunFact
}