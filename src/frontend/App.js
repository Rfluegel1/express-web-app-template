import React from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import PostList from "./PostList";
import PostDetail from "./PostDetail";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PostList/>}/>
                <Route path="/posts" element={<PostDetail/>}/>
            </Routes>
        </Router>
    );
}

export default App;
