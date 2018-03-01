const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');


// load idea model
require('../models/idea');
const Idea = mongoose.model('ideas');

// idea index page
router.get('/',ensureAuthenticated, function (req, res) {
    Idea.find({user: req.user.id})
        .sort({date:'desc'})
        .then(function (ideas) {
            res.render('ideas/index',{
                ideas:ideas,
                name: req.user.name
            });
        });
});

// Add Idea form
router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('ideas/add');
});

// Edit Idea form
router.get('/edit/:id',ensureAuthenticated, function (req, res) {
    Idea.findOne({
        _id: req.params.id
    })
        .then(function (idea) {
            res.render('ideas/edit', {
                idea: idea
            });
        });
});

// process save form
router.post('/',ensureAuthenticated, function (req, res) {
    let errors=[];

    if(!req.body.title){
        errors.push({text:'please add some Title'});
    }
    if(!req.body.details){
        errors.push({text:'please add some Details'});
    }

    if(errors.length > 0){
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    }else{
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new Idea(newUser)
            .save()
            .then(function (idea) {
                req.flash('success_msg', 'Video Idea Added');
                res.redirect('/ideas');
            })
    }
});

// Update form process
router.put('/:id', function (req, res) {
    Idea.findOne({
        _id:req.params.id
    })
        .then(function (idea){
            //new values
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save()
                .then(function (idea){
                    req.flash('success_msg', 'Video Idea Updated');
                    res.redirect('/ideas');
                });
        });
});

// Delete idea
router.delete('/:id',ensureAuthenticated,  function (req, res) {
    Idea.remove({_id: req.params.id})
        .then(function () {
            req.flash('success_msg', 'Video Idea Removed');
            res.redirect('/ideas');
        });
});

module.exports = router;

