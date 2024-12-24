import React, { useState } from "react";
import DiagramEditor from "./components/DiagramEditor";
import CodeGenerator from "./components/CodeGenerator";

const App = () => {
  const [graph, setGraph] = useState(null); // State to manage the graph instance

  return (
    <div>
      <h1>UML Diagram Editor</h1>
      <DiagramEditor setGraph={setGraph} />
      {graph && <CodeGenerator graph={graph} />}
    </div>
  );
};

export default App;