import React from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import PostList from "./PostList";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PostList/>}/>
                <Route path="/posts" element={<PostList/>}/>
            </Routes>
        </Router>
    );
}

export default App;
