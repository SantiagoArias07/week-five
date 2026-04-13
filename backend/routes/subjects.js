const router = require('express').Router();
const auth = require('../middleware/auth');
const { list, getOne, create, remove } = require('../controllers/subjectsController');
const { list: listNotes, create: createNote, update: updateNote, remove: removeNote } = require('../controllers/notesController');

router.use(auth);

// Subject routes
router.get('/', list);
router.get('/:id', getOne);
router.post('/', create);
router.delete('/:id', remove);

// Notes sub-routes
router.get('/:subjectId/notes', listNotes);
router.post('/:subjectId/notes', createNote);
router.put('/:subjectId/notes/:noteId', updateNote);
router.delete('/:subjectId/notes/:noteId', removeNote);

module.exports = router;
