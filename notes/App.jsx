import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid"
import {onSnapshot,addDoc,doc,deleteDoc,setDoc} from "firebase/firestore"
import { notesCollection,db } from "./firebase"
 
export default function App() {
    const [notes, setNotes] = React.useState(
         []
    )
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt)
    
    const currentNote = 
        notes.find(note => note.id === currentNoteId) 
        || notes[0]

    React.useEffect(() => {
      const unsubs=  onSnapshot(notesCollection,function(Snapshot){
             const noteArr=   Snapshot.docs.map(doc=>({
                    ...doc.data(),
                    id:doc.id
                }))
                setNotes(noteArr)
                    
                })
                return unsubs;
        },[])
 
   

    async function createNewNote() {
    
        const newNote = {
            
            body: "# Type your markdown note's title here",
            createdAt:Date.now(),
            updatedAt:Date.now(),

        }
        const newNoteref= await addDoc(notesCollection,newNote);
       
        setCurrentNoteId(newNoteref.id)
    }
    React.useEffect(() => {
        if (!currentNoteId) {
            setCurrentNoteId(notes[0]?.id)
        }
    }, [notes])

    function updateNote(text) {
        const docRef= doc(db,"notes",currentNoteId)
        setDoc(docRef,
            {body:text,updatedAt:Date.now()},
             {merge:true})


    }

     async function deleteNote( noteId) {
        
       const docRef= doc(db,"notes",noteId)
        await deleteDoc(docRef)
    }

    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={sortedNotes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        {
                           
                            <Editor
                                currentNote={currentNote}
                                updateNote={updateNote}
                            />
                        }
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}
