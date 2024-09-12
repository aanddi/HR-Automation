import dotenv from 'dotenv';
import axios from 'axios';
import { Response } from 'express';

import { SearchRequestBody } from './search.interface';
import { RequestWithBody } from 'src/shared/types/request.type';
import { useAssistant } from '../../shared/utils/useAssistant.js';
import { extractUrl } from '../../shared/utils/extractUrl.js';

dotenv.config();


export const SearchService = {
   
   async getSearchListCandidates(req: RequestWithBody<SearchRequestBody>, res: Response) {
      const { description } = req.body;
      const urlHHruApi = (await getUrlHHru(description, res)) as string;

      const listCandidates = await getListСandidates(urlHHruApi as string, res);

      return res.json({ urlHHruApi, listCandidates });
   }
};

const getUrlHHru = async (desc: string, res: Response) => {
   const assistanSearchtId = process.env.OPENAI_ASSISTANT_SEARCH_ID;
 

   if (!assistanSearchtId) return res.status(500).json({ message: 'Server: Assistant ID не установлен.' });
   if (!desc) return res.status(400).json({ message: 'Server: Не указано описание' });

   const response = await useAssistant(assistanSearchtId, desc, res)
   
   if(typeof response === 'string') {
      return extractUrl(response);
   }

   return response;
};


const getListСandidates = async (url: string, res: Response) => {
   const accessToken = process.env.HHRU_API_ACCESS_TOKEN;

   try {
      const listCandidates = await axios.get(url, {
         params: {
            page: 1,
            per_page: 6
         },
         headers: {
            Authorization: `Bearer ${accessToken}`
         }
      });

      return listCandidates.data;
   } catch (error) {
      console.error('Ошибка при взаимодействии с HHru API. Метод => getListСandidates', error);
      res.status(500).json({message: 'Server: Ошибка при взаимодействии с HHru API. Метод => getListСandidates'});
      return [];
   }
};
