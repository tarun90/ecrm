import React, { useEffect, useState } from 'react';
import "./analytics.css"
import { Input } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { getAnalyticsData } from '../OutReach/outreachService';
import NoDataUI from '../../components/NoData';
const {Search} = Input
const Analytics = () => {
    useEffect(()=>{
        fetchAnalyticsData();
    },[])
        const [searchTerm, setsearchTerm] = useState('');
        const [analyticsData, setAnalyticsData] = useState([]);
        const fetchAnalyticsData = async ()=>{
            const data = await getAnalyticsData();
            setAnalyticsData(data);
            console.log(data, "analytics data")
        }
    return (
        <div className="analytics-container">
        <Header className="analytics-header">
            <div className="search-container">
                <h1>Analytics</h1>
                <Search
                    allowClear
                    placeholder="Search Campaign..."
                    value={ searchTerm }
                    onChange={ (e) => setsearchTerm(e.target.value) }
                    className="search-input"
                />
               
            </div>
            <div className="action-buttons">
                {/* <button className="add-contact-btn" onClick={ handleAddCampaign }>
                    <PlusOutlined />
                    Add Campaign
                </button> */}
            </div>
        </Header>
        <div className="contact-table">
            {
                !analyticsData || analyticsData?.length == 0 ?
                <NoDataUI /> :
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Campaign Name</th>
                        <th>Region</th>
                        <th>Data</th>
                        <th>Total Touch</th>
                    </tr>
                </thead>
                <tbody>
                   {
                    analyticsData.map((item)=>(
                        <tr>
                            <td>{item?.category}</td>
                            <td>{item?.campaign}</td>
                            <td>{item?.region}</td>
                            <td>{item?.totalData}</td>
                            <td>{item?.totalTouches}</td>
                        </tr>
                    ))
                   }
                </tbody>
            </table> }
        </div>




    </div>
    );
};

export default Analytics;
