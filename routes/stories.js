const express = require('express');

const router = express.Router();

const {ensureAuth } = require('../middleware/auth');

const Story = require('../models/story')

//description === add page
//route === GET stories/add

router.get('/add',ensureAuth,(req,res) => {
    res.render('stories/add')
})

//description === process add form
//route === Post /stories

router.post('/',ensureAuth,async (req,res) => {
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err);
        res.render('error/500')
    }
})

// show single story
// GET  /stories/:id
router.get('/:id',ensureAuth, async (req,res) => {
    try {
        let story = await Story.findById(req.params.id)
            .populate('user')
            .lean()

        if(!story) {
            return res.render('error/404')
        }
        res.render('stories/show', {
            story,
        })
    } catch (err) {
        console.error(err)
        return res.render('error/404')
    }
})

//description === show all stories
//route === GET stories

router.get('/',ensureAuth, async (req,res) => {
    try {
        const stories = await Story.find({ status: 'public'})
            .populate('user')
            .sort({createdAt: 'desc'})
            .lean()
        
        res.render('stories/index', {
            stories,   
        })
    } catch (err) {
        console.log(err);
        res.render('error/500')
    }

})
router.get('/:id', ensureAuth,async (req,res) => {
    try {
        let story = await Story.findById(req.params.id).populate('user').lean()
        if(!story) {
            return res.render('error/404')
        }
        if(story.user._id != req.user.id && story.status == 'private') {
            res.render('error/404')
        }else {
            res.render('stories/show', {
                story,
            })
        }
    } catch (err) {
        console.error(err)
        res.redirect('error/404')
    }
})

//show edit page
router.get('/edit/:id',ensureAuth, async (req,res) => {
    try {
        let story = await Story.findOne({
            _id: req.params.id
        }).lean()
    
        if(!story) {
            return res.render('error/404')
        }
    
        if(story.user != req.user.id) {
            res.redirect('/stories')
        }else {
            res.render('stories/edit', {
                story,
            })
        }
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
    
})

//description === update Story
//route === put stories/add

router.put('/:id',ensureAuth, async (req,res) => {
    try {
        let story = await Story.findById(req.params.id).lean()
        
        if(!story) {
            return res.render('error/404')
        }
        if(story.user != req.user.id) {
            res.redirect('/stories')
        }else {
            story = await Story.findOneAndUpdate({_id: req.params.id}, req.body, {
                new: true,
                runValidators: true,
            })
            res.redirect('/dashboard')
        }
    } catch (error) {
        console.error(error)
        res.render('error/500')   
    }
   
    })

    //description === delete page
//route === GET stories/:id

router.delete('/:id',ensureAuth, async(req,res) => {
    try {
        await Story.remove( {_id: req.params.id} )
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

//user stories
// get stories/user/:userid
router.get('/user/:userId',ensureAuth,async (req,res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public',
        })
        .populate('user')
        .lean()
        res.render('stories/index', {
            stories,
        } )
    } catch (err) {
        console.log(err)
        return res.render('error/500')
    }
})

module.exports = router;