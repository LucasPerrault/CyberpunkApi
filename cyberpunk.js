import Dal from "./dal";
import NotfoundError from "./errors/notfound.error";
import BadrequestError from "./errors/badrequest.error";

class Cyberpunk {
    constructor() {
    }

    async getAllMercsAsync() {
        const dal = new Dal();
        const mercs = await dal.getAllMercsAsync();
        if (!mercs.length) {
            throw new NotfoundError("Sorry, no mercs was found");
        }

        return mercs;
    }

    async prepareWeaponForMercsAsync(mercs) {
        const mercsWithWeaponPromises = Promise.all(
            mercs.map(async merc => ({
                ...merc,
                weapon: await this.getWeaponByIdAsync(merc.idWeapon)
            })
        ));

        return await mercsWithWeaponPromises;
    }


    async getAllWeaponsAsync() {
        const dal = new Dal();
        const weapons = await dal.getAllWeaponsAsync();
        if (!weapons.length) {
            throw new NotfoundError("Sorry, no weapons was found");
        }
        return weapons;
    }

    async getAllJobsAsync() {
        const dal = new Dal();
        const jobs = await dal.getAllJobsAsync();
        if (!jobs.length) {
            throw new NotfoundError("Sorry, no jobs was found");
        }
        return jobs;
    }

    async getMercByIdAsync(idMerc) {
        if (!idMerc) {
            throw new NotfoundError(`Sorry, no merc n°${idMerc} was found`);
        }

        const dal = new Dal();
        const merc = await dal.getMercByIdAsync(idMerc);
        if (!merc) {
            throw new NotfoundError(`Sorry, no merc n°${idMerc} was found`);
        }

        const weapon = await this.getWeaponByIdAsync(merc.idWeapon);
        return {
            ...merc,
            weapon
        }
    }

    async getWeaponByIdAsync(idWeapon) {
        if (!idWeapon) {
            throw new NotfoundError(`Sorry, no weapon n°${idWeapon} was found`);
        }

        const dal = new Dal();
        const weapon = await dal.getWeaponByIdAsync(idWeapon);
        if (!weapon) {
            throw new NotfoundError(`Sorry, no weapon n°${idWeapon} was found`);
        }
        return weapon;
    }

    async getJobByIdAsync(idJob) {
        const dal = new Dal();
        const job = await dal.getJobByIdAsync(idJob);
        if (!job) {
            throw new NotfoundError(`Sorry, no job n°${idJob} was found`);
        }
        return job;
    }

    async createMercAsync(nickname, legalAge) {
        if (legalAge <= 0) {
            throw new BadrequestError(`Sorry, age must be higher than 0`);
        }
        const dal = new Dal();
        const mercId = await dal.createMercAsync(nickname, legalAge);
        return await this.getMercByIdAsync(mercId);
    }

    async updateMercWeaponAsync(idMerc, idWeapon) {
        const dal = new Dal();
        const merc = await this.getMercByIdAsync(idMerc);
        const weapon = await this.getWeaponByIdAsync(idWeapon);

        if (merc.eddies < weapon.price) {
            throw new BadrequestError(`Sorry the merc has not enough eddies to buy it`);
        }

        await dal.updateMercWeaponAsync(idMerc, idWeapon);
        await dal.updateMercEddiesAsync(idMerc, merc.eddies - weapon.price);
    }

    async updateMercEddiesAsync(idMerc, idJob) {
        const merc = await this.getMercByIdAsync(idMerc);
        const job = await this.getJobByIdAsync(idJob);

        const dal = new Dal();
        const eddiesAfterJobCompleted = merc.eddies + job.reward;
        await dal.updateMercEddiesAsync(merc.id, eddiesAfterJobCompleted);
        return job;
    }

    async killMercAsync(idMerc) {
        const merc = await this.getMercByIdAsync(idMerc);
        if (!merc.isAlive) {
            throw new BadrequestError(`Sorry the merc is already dead !`);
        }

        const dal = new Dal();
        await dal.killMercAsync(idMerc);
    }

    async updateJobToComplete(job) {
        const dal = new Dal();
        if (!job.isAvailable) {
            throw new BadrequestError(`Sorry the job n°${job.id} is already unavailable`);
        }
        await dal.updateJobToComplete(job.id);
    }

    async createJobAsync(fixer, title, description, henchmenCount, reward) {
        const dal = new Dal();
        if (reward <= 0) {
            throw new BadrequestError(`Sorry the reward must be higher than 0 !`);
        }

        if (henchmenCount < 0) {
            throw new BadrequestError(`Sorry the henchmen count must be higher or equal than 0 !`);
        }

        const jobId = await dal.createJobAsync(fixer, title, description, henchmenCount, reward);
        return await this.getJobByIdAsync(jobId);
    }
}

const cyb = new Cyberpunk();
export let cyberpunk = () => cyb
