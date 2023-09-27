import cron from 'node-cron';
import * as fs from 'fs';
import path from 'path';

const task = cron.schedule('0 3 * * *', () => {
    const dir = path.resolve(".data/listas/");
    const files = fs.readdirSync(dir);
    for(const file of files){    
        const stats = fs.statSync(path.join(dir,file)); 
        const diffFile = new Date().getTime() - new Date(stats.ctime).getTime();

        if(Math.floor( diffFile/(1000*3600*24) ) > 7) fs.unlinkSync(path.join(dir,file));

    }
});

export default task;