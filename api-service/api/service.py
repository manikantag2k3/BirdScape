#---------------------------------------------------------------------
from api.src.misc.config import cfg, cfg_from_file
from api.src.dataset import TextDataset
from api.src.trainer import condGANTrainer as trainer
import os

import time
import random
import pprint
import numpy as np

import torch
import torchvision.transforms as transforms

from starlette.middleware.cors import CORSMiddleware

from pathlib import Path
#import streamlit as st
from fastapi import FastAPI, File, Form, Query
from fastapi.responses import FileResponse
#---------------------------------------------------------------------

def gen_example(wordtoix, algo, text):
    """generate images from example sentences"""
    from nltk.tokenize import RegexpTokenizer

    data_dic = {}

    captions = []
    cap_lens = []

    sent = text.replace("\ufffd\ufffd", " ")
    tokenizer = RegexpTokenizer(r"\w+")
    tokens = tokenizer.tokenize(sent.lower())

    rev = []
    for t in tokens:
        t = t.encode("ascii", "ignore").decode("ascii")
        if len(t) > 0 and t in wordtoix:
            rev.append(wordtoix[t])
    captions.append(rev)
    cap_lens.append(len(rev))
    max_len = np.max(cap_lens)

    sorted_indices = np.argsort(cap_lens)[::-1]
    cap_lens = np.asarray(cap_lens)
    cap_lens = cap_lens[sorted_indices]
    cap_array = np.zeros((len(captions), max_len), dtype="int64")
    for i in range(len(captions)):
        idx = sorted_indices[i]
        cap = captions[idx]
        c_len = len(cap)
        cap_array[i, :c_len] = cap
    name = "output"
    key = name[(name.rfind("/") + 1) :]
    data_dic[key] = [cap_array, cap_lens, sorted_indices]
    algo.gen_example(data_dic)

# Setup FastAPI app
app = FastAPI(
    title="API Server",
    description="API Server",
    version="v1"
)

@app.on_event("startup")
async def startup():
    # Startup tasks
    # Start the tracker service
    ...


@app.on_event("shutdown")
async def shutdown():
    # Shutdown tasks
    ...

# Enable CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)




# Routes
@app.get("/")
async def get_index():
    return {
        "message": "Welcome to the API Service"
    }



@app.post("/text2image")
async def text2audio(json_obj: dict):

    
    cfg_from_file("api/eval_bird.yml")
    cfg.CUDA = False
    manualSeed = 100
    random.seed(manualSeed)
    np.random.seed(manualSeed)
    torch.manual_seed(manualSeed)

    output_dir = "output/"
    split_dir = "test"
    bshuffle = True
    imsize = cfg.TREE.BASE_SIZE * (2 ** (cfg.TREE.BRANCH_NUM - 1))

    image_transform = transforms.Compose(
        [
            transforms.Resize(int(imsize * 76 / 64)),
            transforms.RandomCrop(imsize),
            transforms.RandomHorizontalFlip(),
        ]
    )

    dataset = TextDataset(
        cfg.DATA_DIR, split_dir, base_size=cfg.TREE.BASE_SIZE, transform=image_transform
    )
    assert dataset
    dataloader = torch.utils.data.DataLoader(
        dataset,
        batch_size=cfg.TRAIN.BATCH_SIZE,
        drop_last=True,
        shuffle=bshuffle,
        num_workers=int(cfg.WORKERS),
    )


    algo = trainer(output_dir, dataloader, dataset.n_words, dataset.ixtoword)

    # generate images for customized captions
    gen_example(dataset.wordtoix, algo, text=json_obj["text"])

    # center_element(type="subheading", text="AttnGAN synthesized bird")
    # st.text("")
    # center_element(
    #     type="image", img_path="models/bird_AttnGAN2/output/0_s_0_g2.png"
    # )

    # center_element(type="subheading", text="The attention given for each word")
    # st.image("models/bird_AttnGAN2/output/0_s_0_a1.png")

    # st.markdown("---")
    # with st.beta_expander("Click to see the first stage images"):
    #     st.write("First stage image")
    #     st.image("models/bird_AttnGAN2/output/0_s_0_g1.png")
    #     st.write("First stage attention")
    #     st.image("models/bird_AttnGAN2/output/0_s_0_a0.png")
    #return FileResponse("models/bird_AttnGAN2/output/0_s_0_g2.png")
    return {
        "image_path": "api-service/api/models/bird_AttnGAN2/output/0_s_0_g2.png",
        "text": json_obj["text"]
    }

@app.get("/get_image")
async def get_audio_data(
        path: str = Query(..., description="Image path")):
    return FileResponse("api/models/bird_AttnGAN2/output/0_s_0_g2.png", media_type="image/png")

@app.get("/get_feature_image")
async def get_audio_data(
        path: str = Query(..., description="Image path")):
    return FileResponse("api/models/bird_AttnGAN2/output/0_s_0_a1.png", media_type="image/png")