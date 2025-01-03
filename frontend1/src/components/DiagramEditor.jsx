import React, { useEffect, useRef, useState } from "react";
import { dia, shapes } from "jointjs";
import "../style/DiagramEditor.css";

const DiagramEditor = ({ setGraph }) => {
  const graphRef = useRef(null);
  const paperRef = useRef(null);
  const paperInstance = useRef(null);
  const [counter, setCounter] = useState(1);
  const [scale, setScale] = useState(1);
  const [className, setClassName] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [methods, setMethods] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [sourceClass, setSourceClass] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [relationshipType, setRelationshipType] = useState("Association");

  useEffect(() => {
    const graph = new dia.Graph({}, { cellNamespace: shapes });
    graphRef.current = graph;
    setGraph(graph);

    const paper = new dia.Paper({
      el: paperRef.current,
      model: graph,
      width: 1000,
      height: 600,
      gridSize: 10,
      drawGrid: true,
    });
    paperInstance.current = paper;

    return () => graph.clear();
  }, [setGraph]);

  const addClass = () => {
    if (!className) {
      alert("Please provide a class name.");
      return;
    }

    const umlClass = new shapes.uml.Class({
      position: { x: 100 + counter * 30, y: 100 + counter * 20 },
      size: { width: 200, height: 100 },
      name: `${visibility} ${className}`, 
      attributes: attributes.map((attr) => `${attr.trim()}`), 
      methods: methods.map((method) => `${method.trim()}`),
    });

    graphRef.current.addCell(umlClass);
    setCounter(counter + 1);
    setClassName("");
    setAttributes([]);
    setMethods([]);
    setVisibility("public");
  };

  const addRelationship = () => {
    const cells = graphRef.current.getCells();
    const source = cells.find((cell) => cell.get("name") === sourceClass);
    const target = cells.find((cell) => cell.get("name") === targetClass);

    if (!source || !target) {
      alert("Please select valid source and target classes.");
      return;
    }

    let relationship;
    if (relationshipType === "Inheritance") {
      relationship = new shapes.uml.Generalization({
        source: { id: source.id },
        target: { id: target.id },
      });
    } else if (relationshipType === "Aggregation") {
      relationship = new shapes.uml.Aggregation({
        source: { id: source.id },
        target: { id: target.id },
      });
    } else if (relationshipType === "Composition") {
      relationship = new shapes.uml.Composition({
        source: { id: source.id },
        target: { id: target.id },
      });
    } else {
      relationship = new shapes.uml.Association({
        source: { id: source.id },
        target: { id: target.id },
      });
    }

    graphRef.current.addCell(relationship);
    setSourceClass("");
    setTargetClass("");
  };

  const zoom = (factor) => {
    if (paperInstance.current) {
      const newScale = scale + factor;
      if (newScale >= 0.5 && newScale <= 2) {
        paperInstance.current.scale(newScale, newScale);
        setScale(newScale);
      } else {
        alert("Zoom level must be between 0.5 and 2.");
      }
    }
  };

  const getClassNames = () => {
    if (!graphRef.current) return [];
    return graphRef.current
      .getCells()
      .filter((cell) => cell.isElement())
      .map((cell) => cell.get("name"));
  };

  const saveDiagram = () => {
    const diagramJSON = graphRef.current.toJSON();
    localStorage.setItem("umlDiagram", JSON.stringify(diagramJSON));
    alert("Diagram saved!");
  };

  const loadDiagram = () => {
    const diagramJSON = localStorage.getItem("umlDiagram");
    if (diagramJSON) {
      graphRef.current.fromJSON(JSON.parse(diagramJSON));
      alert("Diagram loaded!");
    } else {
      alert("No saved diagram found.");
    }
  };

  const resetDiagram = () => {
    graphRef.current.clear();
    setCounter(1);
    alert("Diagram reset!");
  };

  return (
    <div className="diagram-editor">
      <div className="container">
        <div className="form-section">
          <h2>Add Class</h2>
          <input
            className="class-name-input"
            type="text"
            placeholder="Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <br />
          <textarea
            placeholder="Attributes (comma-separated)"
            value={attributes.join(", ")}
            onChange={(e) => setAttributes(e.target.value.split(","))}
            rows="3"
          />
          <br />
          <textarea
            placeholder="Methods (comma-separated)"
            value={methods.join(", ")}
            onChange={(e) => setMethods(e.target.value.split(","))}
            rows="3"
          />
          <br />
          <div className="select-button-container">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="protected">Protected</option>
            </select>

            <button className="button" onClick={addClass}>
              Add Class
            </button>
          </div>
        </div>

        <div className="form-section">
          <h2>Add Relationship</h2>
          <select
            value={sourceClass}
            onChange={(e) => setSourceClass(e.target.value)}
          >
            <option value="">Select Source Class</option>
            {getClassNames().map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
          <br />

          <select
            value={targetClass}
            onChange={(e) => setTargetClass(e.target.value)}
          >
            <option value="">Select Target Class</option>
            {getClassNames().map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
          <br />
          <div className="select-button-container">
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
            >
              <option value="Association">Association</option>
              <option value="Inheritance">Inheritance</option>
              <option value="Aggregation">Aggregation</option>
              <option value="Composition">Composition</option>
            </select>
            <br />
            <button className="button" onClick={addRelationship}>Add Relationship</button>
          </div>
        </div>

        
      </div>
      <div className="container">
        <div className="form-section">
          <div className="select-button-container">
          <h2>Diagram Controls</h2>
          <button className="button" onClick={() => zoom(0.1)}>Zoom In</button>
          <button className="button" onClick={() => zoom(-0.1)}>Zoom Out</button>
          <button className="button" onClick={saveDiagram}>Save Diagram</button>
          <button className="button" onClick={loadDiagram}>Load Diagram</button>
          <button className="button" onClick={resetDiagram}>Reset Diagram</button>
          </div>
        </div>
        <div
          className="paper-section"
          ref={paperRef}
          style={{
            border: "1px solid #ccc",
            marginTop: "10px",
            width: "1000px",
            height: "600px",
            overflow: "hidden",
          }}
        />
      </div>
    </div>
  );
};

export default DiagramEditor;
