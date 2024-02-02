import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchAllClass, fetchAllDomain, fetchAllElements } from "../../services/api";
import { faBox, faObjectGroup, faSquarePollVertical } from "@fortawesome/free-solid-svg-icons";
import ClassForm from "./ClassForm";
import ItemForm from "./ItemForm";
import ElementForm from "./ElementForm";
import "./admin.css";

function Admin() {
  const history = useHistory();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showElementForm, setShowElementForm] = useState(false);
  const [classTypes, setClassTypes] = useState([]);
  const [domains, setDomains] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classDetails, setClassDetails] = useState([]);
  const [elements, setElements] = useState([]);
  const [nicknameCount, setNicknameCount] = useState(0);
  const [buildingCount, setBuildingCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [expandedClasses, setExpandedClasses] = useState([]);

  // Fetch and update the element counts when the component mounts
  // useEffect(() => {
  //   const fetchElementCounts = async () => {
  //     try {
  //       const elementsResponse = await fetchAllElements();
  //       if (elementsResponse.payload) {
  //         // Filter elements with class name "building"
  //         const buildingElements = elementsResponse.payload.filter(
  //           (element) => {
  //             return element.classDTO && element.classDTO.name === "building";
  //           }
  //         );
  //         // Count the number of building elements
  //         const buildingCount = buildingElements.length;
  //         setBuildingCount(buildingCount);
  //         // Filter elements with class name "nickname"
  //         const nicknameElements = elementsResponse.payload.filter(
  //           (element) => {
  //             return element.classDTO && element.classDTO.name === "nickname";
  //           }
  //         );
  //         // Count the number of nickname elements
  //         const nicknameCount = nicknameElements.length;
  //         setNicknameCount(nicknameCount);
  //         // Filter elements with class name "nickname"
  //         const itemElements = elementsResponse.payload.filter((element) => {
  //           return element.classDTO && element.classDTO.name === "depot";
  //         });
  //         // Count the number of nickname elements
  //         const itemCount = itemElements.length;
  //         setItemCount(itemCount);
  //       } else {
  //         console.error("Error in API response. No payload found.");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching element counts:", error.message);
  //     }
  //   };

  //   fetchElementCounts();
  // }, []);

  // Fetch domains when the component mounts
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetchAllDomain();
        if (response.errorCode === 0) {
          setDomains(response.payload);
        } else {
          throw new Error("Error fetching classes");
        }
      } catch (error) {
        console.error("Error fetching class types:", error.message);
      }
    };

    fetchDomains(); // Call the function to fetch class types when the component mounts
  }, []);

  // Fetch classes when the component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetchAllClass();
        if (response.errorCode === 0) {
          setClasses(response.payload);
        } else {
          throw new Error("Error fetching classes");
        }
      } catch (error) {
        console.error("Error fetching class types:", error.message);
      }
    };

    fetchClasses(); // Call the function to fetch class types when the component mounts
  }, []);

  // Fetch elements when the component mounts
  useEffect(() => {
    const fetchElements = async () => {
      try {
        const response = await fetchAllElements(20);
        if (response.errorCode === 0) {
          setElements(response.payload);
        } else {
          throw new Error("Error fetching classes");
        }
      } catch (error) {
        console.error("Error fetching class types:", error.message);
      }
    };

    fetchElements(); // Call the function to fetch class types when the component mounts
  }, []);

  // Log class details when classDetails state changes
  useEffect(() => {
    console.log("Class Details:", classDetails);
  }, [classDetails]);

  // Fetch data for testing purposes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allClass = await fetchAllClass();
        console.log("ALL CLASSES: " + JSON.stringify(allClass));
        // const path = await fetchPath();
        // console.log("A PATH: " + JSON.stringify(path));
        // const aclass = await fetchClass('65b14eabda7e78564e80beeb');
        // console.log("ONE CLASS: " + JSON.stringify(aclass));
        // const element = await fetchAllElements();
        // console.log("ALL ELEMENTS: " + JSON.stringify(element));
        // const aelement = await fetchElement('659f37c68a79764e92f1d0d8');
        // console.log("ONE ELEMENT: " + JSON.stringify(aelement));
      } catch (error) {
        console.error("Error fetching class types:", error.message);
      }
    };

    fetchData(); // Call the function to fetch class types when the component mounts
  }, []);

  // Handle row click to navigate to detail page
  const handleRowClick = (classId) => {
    history.push(`/admin/${classId}`); // Navigate to detail page with the class_id
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleItemClick = (formType) => {
    // Handle item click here (e.g., navigate to a specific form or perform an action)
    console.log(`Clicked ${formType}`);
  };

  // Render class hierarchy
  const renderClassHierarchy = (classes) => {
    const filteredClasses = classes.filter(
      (classItem) =>
        !classItem.extendsClass || classItem.extendsClass.length === 0
    );

    const renderHierarchy = (parentClass, indentationLevel = 1) => {
      const isExpanded = expandedClasses.includes(parentClass.id);
      const children = classes.filter(
        (classItem) =>
          classItem.extendsClass &&
          classItem.extendsClass.includes(parentClass.id)
      );

      if (children.length === 0) {
        return (
          <tr
            key={parentClass.id}
            onClick={() => handleRowClick(parentClass.id)}
            className="class-item"
          >
            <td style={{ paddingLeft: `${indentationLevel * 20}px` }}>
              {formatClassName(parentClass.name)}
            </td>
            <td>{parentClass.id}</td>
            {/* <td>{parentClass.extendsClass && parentClass.extendsClass.length > 0 ? parentClass.extendsClass.join(', ') : 'None'}</td> */}
          </tr>
        );
      }

      return (
        <>
          <tr
            key={parentClass.id}
            onClick={() => toggleClassExpansion(parentClass.id)}
            className="class-item"
          >
            <td style={{ paddingLeft: `${indentationLevel * 20}px` }}>
              <span>{isExpanded ? "[-] " : "[+] "}</span>
              {formatClassName(parentClass.name)}
            </td>
            <td>{parentClass.id}</td>
          </tr>
          {isExpanded &&
            children.map((child) =>
              renderHierarchy(child, indentationLevel + 1)
            )}
        </>
      );
    };
    return filteredClasses.map((parentClass) => renderHierarchy(parentClass));
  };

  // Toggle class expansion in the hierarchy
  const toggleClassExpansion = (classId) => {
    setExpandedClasses((prevExpandedClasses) =>
      prevExpandedClasses.includes(classId)
        ? prevExpandedClasses.filter((id) => id !== classId)
        : [...prevExpandedClasses, classId]
    );
  };

  // Format class name for display
  const formatClassName = (name) => {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    return capitalized.replace(/-/g, ' ');
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Button to add a new class */}
      <div className="new-class-button">
        <button
          onClick={() => {
            handleItemClick("Class");
            setShowClassForm(true);
          }}
          className="dropbtn"
        >
          <span>+</span> New Class
        </button>
        {showClassForm && (
          <ClassForm
            setShowClassForm={setShowClassForm}
            classTypes={classTypes}
          />
        )}
      </div>
      <br />

      {/* <div className="dropdown"> */}
      {/* <button onClick={toggleDropdown} className="dropbtn">
            <span>+</span> New
          </button>
          {showDropdown && (
            <div className="dropdown-content">
              
              {showClassForm && (
                <ClassForm
                  setShowClassForm={setShowClassForm}
                  classTypes={classTypes}
                />
              )}
              <button
                onClick={() => {
                  handleItemClick("Class");
                  setShowClassForm(true);
                }}
              >
                Class
              </button>

              {showLocationForm && (
                <LocationForm setShowLocationForm={setShowLocationForm} />
              )}
              <button
                onClick={(event) => {
                  handleItemClick(event);
                  setShowLocationForm(!showLocationForm);
                }}
              >
                Location
              </button>

              {showNicknameForm && (
                <NicknameForm setShowNicknameForm={setShowNicknameForm} />
              )}
              <button
                onClick={(event) => {
                  handleItemClick(event);
                  setShowNicknameForm(!showNicknameForm);
                }}
              >
                Nickname
              </button>

              {showItemForm && <ItemForm setShowItemForm={setShowItemForm} />}
              <button
                onClick={(event) => {
                  handleItemClick(event);
                  setShowItemForm(!showItemForm);
                }}
              >
                Item
              </button>

            </div>
          )}
        </div>*/}

      {/* Card container for displaying statistics */}
      <div className="card-container">

        {/* Card for total classes */}
        <div className="admin-card">
          <div className="card-content">
            <div>
              <h2>{buildingCount}</h2>
              <p>Total classes</p>
            </div>
            <div className="card-icon">
              <FontAwesomeIcon icon={faBox} title="Home" />
            </div>
          </div>
          <div className="card-action">
            <span className="card-add">+</span>
          </div>
        </div>

        {/* Card for total locations */}
        <div className="admin-card">
          <div className="card-content">
            <div>
              <h2>{nicknameCount}</h2>
              <p>Total Locations</p>
            </div>
            <div className="card-icon">
              <FontAwesomeIcon icon={faObjectGroup} title="Home" />
            </div>
          </div>
          <div
            className="card-action"
            onClick={() => setShowElementForm(!showElementForm)}
          >
            <span className="card-add">+</span>
          </div>
          {showElementForm && (
            <ElementForm setShowElementForm={setShowElementForm} />
          )}
        </div>

        {showItemForm && <ItemForm setShowItemForm={setShowItemForm} />}

        {/* Card for authorized users */}
        <div className="admin-card">
          <div className="card-content">
            <div>
              <h2>{itemCount}</h2>
              <p>Authorized Users</p>
            </div>
            <div className="card-icon">
              <FontAwesomeIcon icon={faSquarePollVertical} title="Home" />
            </div>
          </div>
          <div
            className="card-action"
            onClick={() => setShowClassForm(!showClassForm)}
          >
            <span className="card-add">+</span>
          </div>
        </div>
      </div>

      {/* Display categories in a table */}
      <div className="categories-display">
        <div className="card-display">
          <h2>Categories</h2>
          <table className="class-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                {/* <th>Extended Classes</th> */}
              </tr>
            </thead>
            <tbody>{renderClassHierarchy(classes)}</tbody>
          </table>
        </div>
      </div>

      {/* Display domains in a table */}
      <div className="card-container">
        <div className="card-display">
          <h2>Domains</h2>
          <table className="class-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((classItem, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(classItem.id)}
                  className="class-item"
                >
                  <td>{formatClassName(classItem.name)}</td>
                  <td>{classItem.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
        <br />

        {/* Display classes in a table */}
        <div className="card-display">
          <h2>Classes</h2>
          <table className="class-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(classItem.id)}
                  className="class-item"
                >
                  <td>{formatClassName(classItem.name)}</td>
                  <td>{classItem.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
        <br />

        {/* Display elements in a table */}
        <div className="card-display">
          <h2>Elements</h2>
          <table className="class-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {elements.map((classItem, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(classItem.id)}
                  className="class-item"
                >
                  <td>{formatClassName(classItem.name)}</td>
                  <td>{classItem.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br /><br /><br /><br /><br />
      </div><br /><br />
    </div>
  );
}

export default Admin;
