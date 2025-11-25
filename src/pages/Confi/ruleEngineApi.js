import axios from 'axios';
import { baseURL } from '../baseurl/apiDomain';

const token = localStorage.getItem('access_token');

const BASE_URL2 = `${baseURL}rule_engine/applicable_models/loyalty_re.json?access_token=${token}&company_id=44&active=true`;

  const api = axios.create({
    baseURL: BASE_URL2,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  

  // Fetch Master Attributes with companyId and activeStatus
export const fetchMasterAttributes = async (companyId, activeStatus) => {
    try {
      const response = await api.get('/master_attributes', {
        params: {
          companyId,
          activeStatus,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching master attributes:', error);
      throw error;
    }
  };

  // Fetch Sub Attributes based on Master Attribute ID
export const fetchSubAttributes = async (masterAttributeId) => {
    try {
      const response = await api.get('/sub_attributes', {
        params: {
          masterAttributeId,
        },
      });
      return response.data;
      
    } catch (error) {
      console.error('Error fetching sub attributes:', error);
      throw error;
    }
  };
  

  // Fetch Master Reward Outcomes with companyId and activeStatus
export const fetchMasterRewardOutcomes = async (companyId, activeStatus) => {
    try {
      const response = await api.get('/master_reward_outcomes', {
        params: {
          companyId,
          activeStatus,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching master reward outcomes:', error);
      throw error;
    }
  };


  // Fetch Sub reward outcome based on Master reward outcome ID
export const fetchSubRewardOutcomes = async (masterRewardOutcomeId) => {
  try {
    const response = await api.get('/sub_master_reward_outcomes', {
      params: {
        masterRewardOutcomeId,
      },
    });
    return response.data;
    
  } catch (error) {
    console.error('Error fetching sub attributes:', error);
    throw error;
  }
};