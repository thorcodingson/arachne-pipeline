# Arachne Pipeline

A resilient, event-driven data pipeline for scalable web scraping and AI-powered data processing, built on Kubernetes.

_This project is designed to run on any cloud provider (Azure, AWS, GCP) or on-premise server that can provide a virtual machine running Ubuntu 22.04 LTS with the specified parameters. The choice of Azure in this guide is for demonstration purposes only._

---

## 🚀 Target Architecture

`User/API -> Scraper Service -> Proxy Service -> Target Website`
`Scraper Service -> [Kafka Topic: html-to-process]`
`Processor Service (AI) <- [Kafka Topic: html-to-process]`
`Processor Service -> [Kafka Topic: data-to-persist]`
`Writer Service <- [Kafka Topic: data-to-persist]`
`Writer Service -> PostgreSQL (DB)`
`Writer Service -> Redis (Cache)`

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Orchestration:** Kubernetes (K8s)
- **Messaging:** Apache Kafka (managed by Strimzi)
- **Databases:** PostgreSQL (for persisted data), Redis (for caching)
- **AI:** Azure OpenAI
- **Testing:** k6 (for stress testing)
- **Observability:** Prometheus & Grafana
- **Infrastructure:** Azure VM, Docker

---

## ⚙️ Setup & Deployment

This guide will walk you through deploying the entire Arachne Pipeline from scratch.

### Prerequisites

Before you begin, ensure you have the following installed locally and configured:

- An active cloud subscription (e.g., Azure, AWS, GCP).
- `git`
- `ssh`
- `kubectl`
- An Azure OpenAI API Key (or equivalent).

### Step 1: Provision & Configure Infrastructure

This step involves setting up a virtual machine and bootstrapping a Kubernetes cluster.

<details>
<summary>Click to expand detailed VM and Kubernetes installation steps</summary>

**1. Provision Virtual Machine**

Create a Virtual Machine with the following specifications:

- **Image:** Ubuntu Server 22.04 LTS
- **Size:** `Standard_B4ms` (4 vCPU, 16 GB RAM) or larger.
- **Networking:** Ensure inbound ports `22` (SSH), `80` (HTTP), and `443` (HTTPS) are open.

**2. Install System Dependencies**

Connect to the VM via SSH and run the following:

```bash
# Update system and install prerequisites
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

# Install Docker Engine (follow official docs for Ubuntu)
# ...

# Install Kubernetes packages
curl -fsSL [https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key](https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key) | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] [https://pkgs.k8s.io/core:/stable:/v1.30/deb/](https://pkgs.k8s.io/core:/stable:/v1.30/deb/) /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

**3. Initialize Kubernetes Cluster**

# Disable swap

sudo swapoff -a
sudo sed -i '/ swap / s/^\(.\*\)$/#\1/g' /etc/fstab

# Initialize control plane

sudo kubeadm init --pod-network-cidr=192.168.0.0/16

# Configure kubectl for your user

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

**4. Install Network Plugin**

Deploy Calico CNI for pod networking.

kubectl apply -f [https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml](https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml)

**5. Install Metrics Server **

Deploy the Kubernetes Metrics Server required for the Horizontal Pod Autoscaler.

kubectl apply -f [https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml](https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml)

</details>

### Step 2: Deploy Kafka Cluster

Deploy the Strimzi operator, which will manage our Kafka cluster.

# Create a dedicated namespace

kubectl create namespace kafka

# Deploy Strimzi Operator

kubectl apply -f [https://github.com/strimzi/strimzi-kafka-operator/releases/download/0.41.0/strimzi-cluster-operator-0.41.0.yaml](https://github.com/strimzi/strimzi-kafka-operator/releases/download/0.41.0/strimzi-cluster-operator-0.41.0.yaml) -n kafka

# Deploy the Kafka Cluster and Topics

kubectl apply -f k8s/01-kafka-cluster/ -n kafka

✨ Key Features

- Asynchronous Data Pipeline: Resilient and fault-tolerant communication based on Apache Kafka.
- AI-Powered Processing: Extracts structured data from raw HTML using Large Language Models.
- Intelligent Proxy: Includes IP rotation with a cooldown logic for "burned" addresses to avoid blocking.
- Automatic Scaling: The system automatically adjusts the number of processing workers based on real-time load, powered by Kubernetes HPA.
- Optimized Performance: Leverages Redis for caching to prevent redundant work and reduce costs.
<!-- end list -->
