// frontend/src/components/TaskGraph.js
import React from 'react';
import { Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

const TaskGraph = ({ tasks }) => {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (containerRef.current && tasks) {
      const nodes = tasks.map((task, index) => ({
        id: index,
        label: task.name,
        color: getPriorityColor(task.priority)
      }));

      const edges = [];
      tasks.forEach((task, index) => {
        if (task.dependencies) {
          task.dependencies.forEach(dep => {
            const depIndex = tasks.findIndex(t => t.name === dep);
            if (depIndex !== -1) {
              edges.push({ from: depIndex, to: index, arrows: 'to' });
            }
          });
        }
      });

      const data = { nodes, edges };
      const options = {
        layout: { hierarchical: { enabled: true, direction: 'LR' } },
        edges: { smooth: true }
      };

      new Network(containerRef.current, data, options);
    }
  }, [tasks]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffd93d';
      case 'low': return '#6bcf7f';
      default: return '#c4c4c4';
    }
  };

  return <div ref={containerRef} style={{ height: '400px', border: '1px solid #ccc' }} />;
};

export default TaskGraph;