// Offline prompt/config export only. No credentials, network or provider mutation.
import {SYSTEM} from '../src/facts.mjs';
console.log(JSON.stringify({
 identity:{name:'Autumn',full_name:'Autumn Winters',role:'Customer Experience Specialist',product:'Crew',endorsement:'Crew by AW Creatives'},
 llm:{general_prompt:SYSTEM,begin_message:'Hi, I’m Autumn Winters, the AI demo Customer Experience Specialist for Crew by AW Creatives. I can explain the studio’s services and help you prepare a request. Your own specialist would be customized for your business. What would you like to explore?',general_tools:[],states:[],knowledge_base_ids:[]},
 agent:{max_call_duration_ms:120000,data_storage_setting:'basic_attributes_only',contact_memory_config:{enable_read:false,enable_update:false},pre_session_tools:[],post_session_tools:[]},
 review_required:'Dedicated AWC published agent; no inherited BrightHome facts/actions/callbacks. Preserve approved voice preference, verify rate and new allowance before activation.'
},null,2));
