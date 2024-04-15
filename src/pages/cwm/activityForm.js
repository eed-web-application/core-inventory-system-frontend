import React, { useState, useEffect } from 'react';
import { createActivity, fetchActivityType, fetchAWork, fetchLovValuesForField } from '../../services/api';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // Importing React Datepicker
import 'react-datepicker/dist/react-datepicker.css';
import './activityForm.css';

function ActivityForm({ showActivityForm, setShowActivityForm }) {
    const { workId } = useParams();
    const [activityData, setActivityData] = useState({
        title: '',
        description: '',
        activityTypeId: '',
        activityTypeSubtype: "BugFix",
        // schedulingProperty: "Immediate",
        customFields: [],
        customFieldValues: {},
    });
    const [activityTypes, setActivityTypes] = useState([]);
    const [activityTypesFetched, setActivityTypesFetched] = useState(false);

    useEffect(() => {
        const fetchWorkAndActivityData = async () => {
            try {
                const worktypeResponse = await fetchAWork(workId);
                const title = worktypeResponse.payload.workType.title;

                if (!activityTypesFetched) {
                    const typeResponse = await fetchActivityType();
                    setActivityTypes(typeResponse || []);
                    setActivityTypesFetched(true);
                }

                let defaultActivityTypeId = '';

                if (title.startsWith("Software")) {
                    const softwareTask = activityTypes.find(type => type.title === "Software Task");
                    defaultActivityTypeId = softwareTask ? softwareTask.id : '';
                } else if (title.startsWith("Hardware")) {
                    const hardwareTask = activityTypes.find(type => type.title === "Hardware Task");
                    defaultActivityTypeId = hardwareTask ? hardwareTask.id : '';
                } else if (title.startsWith("General")) {
                    const generalTask = activityTypes.find(type => type.title === "General Task");
                    defaultActivityTypeId = generalTask ? generalTask.id : '';
                }

                if (defaultActivityTypeId) {
                    handleActivityTypeChange(defaultActivityTypeId);
                }
            } catch (error) {
                console.error('Error fetching activity data:', error);
            }
        };

        fetchWorkAndActivityData();
    }, [activityTypesFetched, workId]);
    
    const fetchCustomFieldsData = async (typeId, customFields) => {
        try {
            const customFieldsData = await Promise.all(
                customFields.map(async field => {
                    try {
                        if (!field.isLov) {
                            return {
                                id: field.id,
                                name: field.name,
                                label: field.label,
                                group: field.group,
                                isLov: false,
                                valueType: field.valueType
                            };
                        } else {
                            const lovValuesResponse = await fetchLovValuesForField("Activity", typeId, field.name);
                            if (lovValuesResponse.errorCode === 0) {
                                return {
                                    id: field.id,
                                    name: field.name,
                                    label: field.label,
                                    group: field.group,
                                    isLov: true,
                                    valueType: lovValuesResponse.payload.map(value => ({ id: value.id, value: value.value }))
                                };
                            } else {
                                console.error('Error fetching LOV values for field:', field.name, lovValuesResponse.errorMessage);
                                throw new Error(lovValuesResponse.errorMessage);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching LOV values for field:', field.name, error.message);
                        throw new Error(error.message);
                    }
                })
            );
            return customFieldsData;
        } catch (error) {
            console.error('Error fetching custom fields data:', error);
            throw new Error(error.message);
        }
    };

    const handleActivityTypeChange = async (typeId) => {
        try {
            const type = activityTypes.find(type => type.id === typeId);
            if (type) {
                const customFieldsData = await fetchCustomFieldsData(typeId, type.customFields || []);
                setActivityData({
                    ...activityData,
                    activityTypeId: typeId,
                    customFields: customFieldsData
                });
            }
        } catch (error) {
            console.error('Error fetching custom fields:', error);
        }
    };

    const handleCustomFieldDateValueChange = (date, fieldId) => {
        const formattedDate = date ? new Date(date).toLocaleString('en-US', { timeZone: 'UTC', month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        setActivityData({
            ...activityData,
            customFieldValues: {
                ...activityData.customFieldValues,
                [fieldId]: formattedDate
            }
        });
    };

    const handleCustomFieldValueChange = (e, fieldId) => {
        const { value } = e.target;
        setActivityData({
            ...activityData,
            customFieldValues: {
                ...activityData.customFieldValues,
                [fieldId]: value
            }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const customFieldValues = activityData.customFields.map(field => {
                const value = {
                    "type": field.valueType === "Boolean" ? "Boolean" : field.valueType === "Date" ? "Date" : field.valueType === "Number" ? "Number" : "String",
                    "value": field.valueType === "Boolean" ? (activityData.customFieldValues[field.id] === "true") :
                        field.valueType === "Date" ? "2024-04-04" :
                            field.valueType === "Number" ? parseFloat(activityData.customFieldValues[field.id]) :
                                activityData.customFieldValues[field.id] || null
                };
                return { id: field.id, value: value };
            });

            const formData = {
                title: activityData.title,
                description: activityData.description,
                activityTypeId: activityData.activityTypeId,
                activityTypeSubtype: activityData.activityTypeSubtype,
                schedulingProperty: activityData.schedulingProperty,
                customFieldValues: customFieldValues,
            };

            console.log(formData);
            await createActivity(workId, formData);
            alert("Activity created successfully!");
            setShowActivityForm(false);
            window.location.reload();
        } catch (error) {
            console.error('Error creating activity:', error, error.message);
            alert(`Error creating activity: ${error.message || "Please try again."}`);
        }
    };

    const renderNewFields = () => {
        const fields = [{ id: 'title', label: 'Title', type: 'text', section: 'General Information' }, { id: 'description', label: 'Description', type: 'textarea', section: 'General Information' }];
        return fields.map(field => (
            <div key={field.id} className="form-group">
                <label htmlFor={field.id} className="form-label">{field.label}<span className="required">*</span></label>
                {field.type === 'textarea' ? (
                    <textarea id={field.id} name={field.id} value={activityData[field.id] || ''} onChange={handleInputChange} className="form-input" required={field.required}></textarea>
                ) : (
                    <input id={field.id} name={field.id} type={field.type} value={activityData[field.id] || ''} onChange={handleInputChange} className="form-input" required={field.required} />
                )}
            </div>
        ));
    };

    const renderCustomFieldInput = (field) => {
        if (field.isLov) {
            return (
                <select id={field.id} name={field.id} value={activityData.customFieldValues[field.id] || ''} onChange={(e) => handleCustomFieldValueChange(e, field.id)} className="form-select">
                    <option value="">Select</option>
                    {field.valueType.map((value, index) => (<option key={index} value={value.id}>{value.value}</option>))}
                </select>
            );
        } else {
            if (field.valueType === "Boolean") {
                return (
                    <select id={field.id} name={field.id} value={activityData.customFieldValues[field.id] || ''} onChange={(e) => handleCustomFieldValueChange(e, field.id)} className="form-select">
                        <option value="">Select</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                );
            } else if (field.valueType === "Date") {
                return (<DatePicker selected={activityData.customFieldValues[field.id] ? new Date(activityData.customFieldValues[field.id]) : null} onChange={(date) => handleCustomFieldDateValueChange(date, field.id)} className="form-input" />);
            } else if (field.valueType === "Number") {
                return (<input id={field.id} name={field.id} type="number" value={activityData.customFieldValues[field.id] || ''} onChange={(e) => handleCustomFieldValueChange(e, field.id)} className="form-input" />);
            } else {
                return (<input id={field.id} name={field.id} value={activityData.customFieldValues[field.id] || ''} onChange={(e) => handleCustomFieldValueChange(e, field.id)} className="form-input" />);
            }
        }
    };

    const renderCustomFieldsBySection = () => {
        const sections = {};
        activityData.customFields.forEach(field => {
            const section = field.group || "Other";
            if (!sections[section]) {
                sections[section] = [];
            }
            sections[section].push(field);
        });

        return Object.keys(sections).map(section => (
            <div key={section}>
                <h3 style={{ color: 'black' }}>{section}</h3>
                {sections[section].map(field => (
                    <div key={field.id} className="form-group">
                        <label htmlFor={field.id} className="form-label">{field.label}</label>
                        {renderCustomFieldInput(field)}
                    </div>
                ))}
            </div>
        ));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setActivityData({ ...activityData, [name]: value });
    };

    return (
        <div className={`modal ${showActivityForm ? "show" : "hide"}`}>
            <div className="activityform-content">
                <span className="close" onClick={() => setShowActivityForm(false)}>&times;</span>
                <p className="activityform-title">New Task</p>
                <hr className="line" /><br></br>
                <form onSubmit={handleSubmit} className="work-form">
                    <div className="form-group">
                        <label className="form-label">Type<span className="required">*</span></label>
                        <div className="button-group">
                            {activityTypes.map(type => (
                                <button key={type.id} type="button" className={`activity-type-button ${activityData.activityTypeId === type.id ? 'selected' : ''}`} onClick={() => handleActivityTypeChange(type.id)}>{type.title}</button>
                            ))}
                        </div>
                    </div>

                    {renderNewFields()}
                    {renderCustomFieldsBySection()}

                    <button type="submit" className="activityform-button">Create Task</button>
                </form>
            </div>
        </div>
    );
}

export default ActivityForm;
